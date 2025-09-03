import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopComponent } from './features/shop/shop.component';
import { ProductDetailsComponent } from './features/shop/product-details/product-details.component';
import { TestErrorComponent } from './features/test-error/test-error.component';
import { ServerErrorComponent } from './shared/components/server-error/server-error.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { CartComponent } from './features/cart/cart.component';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { vendorGuard } from './core/guards/vendor.guard';
import { ContactUsComponent } from './features/contact-us/contact-us.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'shop', component: ShopComponent },
    { path: 'shop/:id', component: ProductDetailsComponent },
    {
        path: 'orders',
        loadChildren: () => import('./features/orders/routes').then(mod => mod.orderRoutes)
    },
    {
        path: 'checkout',
        loadChildren: () => import('./features/checkout/routes').then(mod => mod.checkoutRoutes)
    },
    {
        path: 'account',
        loadChildren: () => import('./features/account/routes').then(mod => mod.accountRoutes)
    },
    { path: 'cart', component: CartComponent },
    { path: 'contact-us', component: ContactUsComponent },
    { path: 'test-error', component: TestErrorComponent },
    { path: 'server-error', component: ServerErrorComponent },
        {
        path: 'admin',
        loadChildren: () => import('./features/admin/routes').then(mod => mod.ADMIN_ROUTES),
        canActivate: [authGuard, adminGuard]
    },
    {
        path: 'vendor',
        loadChildren: () => import('./features/vendor/routes').then(mod => mod.vendorRoutes),
        canActivate: [authGuard, vendorGuard]
    },
    { path: 'not-found', component: NotFoundComponent },
    { path: '**', redirectTo: 'not-found', pathMatch: 'full' }
];

