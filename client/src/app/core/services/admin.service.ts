import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderParams } from '../../shared/models/orderParams';
import { Order } from '../../shared/models/order';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.baseUrl;
  private http = inject(HttpClient);
  
  // Dashboard refresh subject
  private dashboardRefreshSubject = new BehaviorSubject<void>(undefined);
  dashboardRefresh$ = this.dashboardRefreshSubject.asObservable();

  // Method to trigger dashboard refresh
  refreshDashboard() {
    this.dashboardRefreshSubject.next();
  }

  getOrders(orderParams: OrderParams) {
    let params = new HttpParams();
    if (orderParams.filter && orderParams.filter !== 'All') {
      params = params.append('status', orderParams.filter);
    } 
    params = params.append('pageSize', orderParams.pageSize);
    params = params.append('pageIndex', orderParams.pageNumber);
    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', {params});
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }

  refundOrder(id: number) {
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id, {});
  }

  // Product Management Methods
  getProducts(pageSize: number = 10, pageIndex: number = 1, status?: string) {
    let params = new HttpParams();
    params = params.append('pageSize', pageSize);
    params = params.append('pageIndex', pageIndex);
    if (status) {
      params = params.append('status', status);
    }
    return this.http.get<Pagination<Product>>(this.baseUrl + 'admin/products', {params});
  }

  getPendingProductsCount() {
    return this.getProducts(1000, 1, 'Pending'); // Get all pending products to count them
  }

  getAcceptedProductsCount() {
    return this.getProducts(1000, 1, 'Approved'); // Get all approved products to count them
  }

  getRejectedProductsCount() {
    return this.getProducts(1000, 1, 'Rejected'); // Get all rejected products to count them
  }

  getSuspendedProductsCount() {
    return this.getProducts(1000, 1, 'Suspended'); // Get all suspended products to count them
  }

  // Get admin published products count (ExtraMile vendor)
  getAdminPublishedProductsCount() {
    return this.http.get<{ count: number }>(this.baseUrl + 'admin/products/extra-mile/count');
  }

  // Get admin published products list (ExtraMile vendor)
  getAdminPublishedProducts(pageSize: number = 10, pageIndex: number = 1, status?: string) {
    let params = new HttpParams();
    params = params.append('pageSize', pageSize);
    params = params.append('pageIndex', pageIndex);
    if (status) {
      params = params.append('status', status);
    }
    return this.http.get<Pagination<Product>>(this.baseUrl + 'admin/products/extra-mile', {params});
  }

  // Get total vendors count
  getVendorsCount() {
    return this.http.get<{ totalVendors: number }>(this.baseUrl + 'admin/vendors/count');
  }

  // Get all vendors list
  getVendors() {
    return this.http.get<any[]>(this.baseUrl + 'admin/vendors');
  }

  // Get total revenue from all orders
  getTotalRevenue() {
    return this.http.get<{ totalRevenue: number }>(this.baseUrl + 'admin/revenue');
  }

  // Get sales data over time for charts
  getSalesOverTime() {
    return this.http.get<any[]>(this.baseUrl + 'admin/sales-over-time');
  }

  // Get all dashboard data in a single call
  getDashboardData() {
    return this.http.get<any>(this.baseUrl + 'admin/dashboard');
  }

  approveProduct(id: number) {
    return this.http.post<Product>(this.baseUrl + 'admin/products/' + id + '/approve', {});
  }

  rejectProduct(id: number) {
    return this.http.post<Product>(this.baseUrl + 'admin/products/' + id + '/reject', {});
  }

  suspendProduct(id: number) {
    return this.http.post<Product>(this.baseUrl + 'admin/products/' + id + '/suspend', {});
  }
}
