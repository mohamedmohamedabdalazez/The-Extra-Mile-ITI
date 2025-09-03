import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

interface Vendor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
}

@Component({
  selector: 'app-admin-vendors',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-vendors.component.html',
  styleUrls: ['./admin-vendors.component.scss']
})
export class AdminVendorsComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  displayedColumns: string[] = ['name', 'email', 'userName', 'actions'];
  dataSource = new MatTableDataSource<Vendor>([]);
  isLoading = false;

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.isLoading = true;
    this.adminService.getVendors().subscribe({
      next: response => {
        this.dataSource.data = response;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading vendors:', err);
        this.isLoading = false;
      }
    });
  }

  viewVendorProducts(vendor: Vendor): void {
    this.router.navigate(['/admin/products'], { 
      queryParams: { vendorId: vendor.id, vendorName: vendor.firstName + ' ' + vendor.lastName } 
    });
  }

  getVendorFullName(vendor: Vendor): string {
    return `${vendor.firstName} ${vendor.lastName}`;
  }
}
