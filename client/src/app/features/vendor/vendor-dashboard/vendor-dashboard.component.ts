import { Component, inject, OnInit } from '@angular/core';
import { AccountService } from '../../../core/services/account.service';
import { ProductService } from '../../../core/services/product.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule, MatIconModule],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit {
  productService = inject(ProductService);
  accountService = inject(AccountService);
  router = inject(Router);

  vendorName: string = 'Vendor'; // fallback name

  totalProducts = 0;
  pendingProducts = 0;
  approvedProducts = 0;
  rejectedProducts = 0;

  recentProducts: any[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // ✅ Set vendor name from current user
    this.setFallbackUserName();

    // ✅ Get vendor dashboard data using dedicated endpoint
    this.productService.getVendorDashboard().subscribe({
      next: (dashboard: any) => {
        this.totalProducts = dashboard.totalProducts || 0;
        this.pendingProducts = dashboard.pendingProducts || 0;
        this.approvedProducts = dashboard.approvedProducts || 0;
        this.rejectedProducts = dashboard.rejectedProducts || 0;
        this.recentProducts = dashboard.products || [];
      },
      error: err => {
        console.error('Error fetching dashboard data:', err);
        this.recentProducts = [];
        this.totalProducts = 0;
        this.pendingProducts = 0;
        this.approvedProducts = 0;
        this.rejectedProducts = 0;
      }
    });
  }

  // ✅ Quick Actions
  addProduct() {
    this.router.navigate(['/vendor/products/new']);
  }

  viewAllProducts() {
    this.router.navigate(['/vendor/products']);
  }

  viewProduct(product: any) {
    // Navigate to product detail - the detail component will fetch the full product data
    this.router.navigate(['/vendor/products', product.id]);
  }

  private setFallbackUserName(): void {
    const user = this.accountService.currentUser();
    if (user) {
      // Use the username as the store name (this is what was set during registration)
      this.vendorName = user.userName || 'Store';
    }
  }
}
