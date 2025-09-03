import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { AdminService } from '../../../core/services/admin.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductReviewDialogComponent } from '../../../shared/components/product-review-dialog/product-review-dialog.component';

@Component({
  selector: 'app-admin-product-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './admin-product-management.component.html',
  styleUrl: './admin-product-management.component.scss'
})
export class AdminProductManagementComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'brand', 'type', 'price', 'quantityInStock', 'status', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  isLoading = false;
  currentStatus: string | undefined;
  currentVendorId: string | undefined;
  currentVendorName: string | undefined;
  
  // Pagination properties
  totalItems = 0;
  pageSize = 50; // Reduced from 10000 to 50 for better performance
  currentPage = 1;

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    // Check for status query parameter
    this.route.queryParams.subscribe(params => {
      this.currentStatus = params['status'];
      this.currentVendorId = params['vendorId'];
      this.currentVendorName = params['vendorName'];
      this.loadProducts();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.isLoading = true;
    
    // Check if we're filtering for ExtraMile vendor (admin's products)
    if (this.currentVendorName === 'ExtraMile') {
      this.adminService.getAdminPublishedProducts(this.pageSize, this.currentPage, this.currentStatus).subscribe({
        next: response => {
          if (response.data) {
            this.dataSource.data = response.data;
            this.totalItems = response.count || response.data.length;
          }
          this.isLoading = false;
        },
        error: err => {
          console.error('Error loading admin products:', err);
          this.isLoading = false;
        }
      });
    } else {
      // Use regular products API for other cases
      this.adminService.getProducts(this.pageSize, this.currentPage, this.currentStatus).subscribe({
        next: response => {
          if (response.data) {
            // Filter by vendor if vendorId is provided
            let filteredData = response.data;
            if (this.currentVendorId) {
              filteredData = response.data.filter(product => product.vendorId === this.currentVendorId);
            }
            
            this.dataSource.data = filteredData;
            this.totalItems = response.count || response.data.length;
          }
          this.isLoading = false;
        },
        error: err => {
          console.error('Error loading products:', err);
          this.isLoading = false;
        }
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  async approveProduct(product: Product): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      'Confirm Approval',
      `Are you sure you want to approve "${product.name}"?`
    );

    if (confirmed) {
      this.adminService.approveProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          this.adminService.refreshDashboard(); // Trigger dashboard refresh
        },
        error: err => {
          console.error('Error approving product:', err);
        }
      });
    }
  }

  async rejectProduct(product: Product): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      'Confirm Rejection',
      `Are you sure you want to reject "${product.name}"?`
    );

    if (confirmed) {
      this.adminService.rejectProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          this.adminService.refreshDashboard(); // Trigger dashboard refresh
        },
        error: err => {
          console.error('Error rejecting product:', err);
        }
      });
    }
  }

  suspendProduct(product: any): void {
    this.dialogService.confirm('Suspend Product', `Are you sure you want to suspend "${product.name}"?`)
      .then(confirmed => {
        if (confirmed) {
          this.adminService.suspendProduct(product.id).subscribe({
            next: () => {
              this.snackbar.success('Product suspended successfully!');
              this.loadProducts();
              this.adminService.refreshDashboard();
            },
            error: (err) => {
              console.error('Error suspending product:', err);
              this.snackbar.error(err.message || 'Failed to suspend product');
            }
          });
        }
      });
  }

  reviewProduct(product: any): void {
    // Open the beautiful product review dialog
    const dialogRef = this.dialog.open(ProductReviewDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { product: product },
      disableClose: false,
      panelClass: 'product-review-dialog-panel'
    });

    // Handle the dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'approve') {
        this.approveProduct(product);
      } else if (result === 'reject') {
        this.rejectProduct(product);
      }
      // If result is 'cancel' or undefined, do nothing
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Suspended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }
}
