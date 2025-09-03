import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AccountService } from '../../../core/services/account.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    NgxChartsModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private accountService = inject(AccountService);

  private destroy$ = new Subject<void>();
  private refreshInterval: any = null;

  // Real Stats Data
  totalOrders = 0;
  pendingProducts = 0;
  acceptedProducts = 0;
  rejectedProducts = 0;
  suspendedProducts = 0;
  activeVendors = 0;
  totalRevenue = 0;
  adminPublishedProducts = 0;
  isLoading = true;

  // Chart Data
  salesData: any[] = [];
  productStatusData = [
    { name: 'Approved', value: 850 },
    { name: 'Pending', value: 45 },
    { name: 'Rejected', value: 15 },
    { name: 'Suspended', value: 5 }
  ];

  // Chart hover state
  isSalesChartExpanded = false;
  isProductStatusChartExpanded = false;



  ngOnInit(): void {
    this.loadDashboardData();
    
    // Listen for dashboard refresh events
    this.adminService.dashboardRefresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboardData();
      });
    
    // Refresh data every 30 seconds to keep it up to date
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 30000);

    // Monitor authentication state and clear interval when user logs out
    this.accountService.getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (authState) => {
          if (!authState.isAuthenticated) {
            clearInterval(this.refreshInterval);
          }
        },
        error: () => {
          // If auth check fails, clear interval
          clearInterval(this.refreshInterval);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadDashboardData(): void {
    // Check if user is authenticated before making API calls
    if (!this.accountService.currentUser()) {
      console.log('User not authenticated, skipping dashboard data load');
      return;
    }

    this.isLoading = true;
    
    // Load all dashboard data in a single API call
    this.adminService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboardData: any) => {
          this.totalOrders = dashboardData.totalOrders || 0;
          this.pendingProducts = dashboardData.pendingProducts || 0;
          this.acceptedProducts = dashboardData.approvedProducts || 0;
          this.rejectedProducts = dashboardData.rejectedProducts || 0;
          this.suspendedProducts = dashboardData.suspendedProducts || 0;
          this.activeVendors = dashboardData.vendorCount || 0;
          this.totalRevenue = dashboardData.totalRevenue || 0;
          this.adminPublishedProducts = dashboardData.adminPublishedProducts || 0;
          
          // Update the product status chart
          this.updateProductStatusChart();
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading dashboard data:', err);
          this.isLoading = false;
          if (err.status === 401) {
            this.stopRefreshInterval();
            return;
          }
        }
      });

    // Load sales data
    this.loadSalesData();
  }

  private loadSalesData(): void {
    this.adminService.getSalesOverTime()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.salesData = data;
        },
        error: (err: any) => {
          console.error('Error loading sales data:', err);
          // Fallback to empty data if API fails
          this.salesData = [];
        }
      });
  }

  private stopRefreshInterval(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('Refresh interval stopped - user not authenticated');
    }
  }

  updateProductStatusChart(): void {
    // Create new array to trigger change detection
    this.productStatusData = [
      { name: 'Approved', value: this.acceptedProducts },
      { name: 'Pending', value: this.pendingProducts },
      { name: 'Rejected', value: this.rejectedProducts },
      { name: 'Suspended', value: this.suspendedProducts }
    ];
  }

  navigateToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  navigateToPendingProducts(): void {
    this.router.navigate(['/admin/products'], { queryParams: { status: 'Pending' } });
  }

  navigateToAcceptedProducts(): void {
    this.router.navigate(['/admin/products'], { queryParams: { status: 'Approved' } });
  }

  navigateToRejectedProducts(): void {
    this.router.navigate(['/admin/products'], { queryParams: { status: 'Rejected' } });
  }

  navigateToSuspendedProducts(): void {
    this.router.navigate(['/admin/products'], { queryParams: { status: 'Suspended' } });
  }

  navigateToVendors(): void {
    this.router.navigate(['/admin/vendors']);
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/admin/add-product']);
  }

  navigateToAdminProducts(): void {
    this.router.navigate(['/admin/products'], { queryParams: { vendorName: 'ExtraMile' } });
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  // Chart hover methods
  onSalesChartMouseEnter(): void {
    this.isSalesChartExpanded = true;
  }

  onSalesChartMouseLeave(): void {
    this.isSalesChartExpanded = false;
  }

  onProductStatusChartMouseEnter(): void {
    this.isProductStatusChartExpanded = true;
  }

  onProductStatusChartMouseLeave(): void {
    this.isProductStatusChartExpanded = false;
  }
}
