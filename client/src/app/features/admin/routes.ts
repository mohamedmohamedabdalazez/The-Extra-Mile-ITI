import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminProductManagementComponent } from './admin-product-management/admin-product-management.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { AdminVendorsComponent } from './admin-vendors/admin-vendors.component';
import { AdminAddProductComponent } from './admin-add-product/admin-add-product.component';
import { AdminProductReviewComponent } from './admin-product-review/admin-product-review.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent
  },
  {
    path: 'products',
    component: AdminProductManagementComponent
  },
  {
    path: 'orders',
    component: AdminOrdersComponent
  },
  {
    path: 'vendors',
    component: AdminVendorsComponent
  },
  {
    path: 'add-product',
    component: AdminAddProductComponent
  },
  {
    path: 'product-review/:id',
    component: AdminProductReviewComponent
  }
];
