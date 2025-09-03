import { AfterViewInit, Component, ViewChild, OnInit, inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

export interface Product {
  id: number;
  name: string;
  price: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  date: Date;
}

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './vendor-products.component.html',
  styleUrls: ['./vendor-products.component.scss']
})
export class VendorProductsComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['name', 'price', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  originalData: Product[] = [];
  isLoading = true;

  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadProducts();
    
    // Listen for route changes to refresh data
    this.route.params.subscribe(() => {
      this.loadProducts();
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.isLoading = true;
    
    // First try to get all products without pagination
    this.productService.getAllVendorProducts().subscribe({
      next: (response: any) => {
        console.log('All products API response:', response);
        this.processProductsResponse(response);
      },
      error: (error) => {
        console.log('All products endpoint failed, trying paginated endpoint:', error);
        // Fallback to paginated endpoint with large page size
        this.productService.getVendorProducts(1, 100).subscribe({
          next: (response: any) => {
            console.log('Paginated API response:', response);
            this.processProductsResponse(response);
          },
          error: (paginatedError) => {
            console.error('Both endpoints failed:', paginatedError);
            this.isLoading = false;
            this.originalData = [];
            this.dataSource.data = [];
          }
        });
      }
    });
  }

  private processProductsResponse(response: any): void {
    // Handle different possible response formats
    let products: any[] = [];
    
    if (Array.isArray(response)) {
      // Direct array response
      products = response;
    } else if (response && Array.isArray(response.data)) {
      // Paginated response with data array
      products = response.data;
    } else if (response && response.items && Array.isArray(response.items)) {
      // Response with items array
      products = response.items;
    } else if (response && response.products && Array.isArray(response.products)) {
      // Response with products array
      products = response.products;
    } else if (response && response.result && Array.isArray(response.result)) {
      // Response with result array
      products = response.result;
    } else {
      console.warn('Unexpected response format:', response);
      products = [];
    }
    
    console.log('Extracted products:', products);
    console.log('Number of products found:', products.length);
    
    // Transform the API response to match our interface
    this.originalData = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      status: p.status || 'Pending',
      date: new Date(p.createdAt || p.date || Date.now())
    }));
    
    console.log('Transformed products:', this.originalData);
    console.log('Final product count:', this.originalData.length);
    
    this.dataSource.data = this.originalData;
    this.isLoading = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(event: MatSelectChange) {
    const status = event.value;
    if (status) {
      this.dataSource.data = this.originalData.filter(p => p.status === status);
    } else {
      this.dataSource.data = this.originalData;
    }
  }



  viewProduct(product: Product): void {
    this.router.navigate(['/vendor/products', product.id]);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/vendor/products', product.id, 'edit']);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Error deleting product. Please try again.');
        }
      });
    }
  }
}
