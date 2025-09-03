import { Routes } from '@angular/router';
import { VendorDashboardComponent } from './vendor-dashboard/vendor-dashboard.component';
import { VendorProductsComponent } from './vendor-products/vendor-products.component';
import { VendorProductDetailComponent } from './vendor-product-detail/vendor-product-detail.component';
import { VendorProductFormComponent } from './vendor-product-form/vendor-product-form.component';
import { VendorProductReviewComponent } from './vendor-product-review/vendor-product-review.component';

export const vendorRoutes: Routes = [
    { path: 'dashboard', component: VendorDashboardComponent },
    { path: 'products', component: VendorProductsComponent },
    { path: 'products/new', component: VendorProductFormComponent },
    { path: 'products/review', component: VendorProductReviewComponent },
    { path: 'products/:id/edit', component: VendorProductFormComponent },
    { path: 'products/:id', component: VendorProductDetailComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
