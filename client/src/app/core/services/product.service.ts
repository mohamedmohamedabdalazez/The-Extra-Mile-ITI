import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../shared/models/product';
import { VendorDashboardDto } from '../../shared/models/vendor-dashboard';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'https://localhost:5001/api'; 

  constructor(private http: HttpClient) {}

  // Add new product
  addProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/vendor/products`, product);
  }

  // Add new product as admin
  addProductAsAdmin(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products`, product);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  // Get a specific vendor product
  getVendorProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/vendor/products/${id}`);
  }

  // Get all products for current vendor
  getVendorProducts(page: number = 1, pageSize: number = 100): Observable<any[]> {
    // Try to get all products by using a large page size
    return this.http.get<any[]>(`${this.baseUrl}/vendor/products?page=${page}&pageSize=${pageSize}`);
  }

  // Get all products for current vendor without pagination
  getAllVendorProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/vendor/products/all`);
  }

  // Get vendor dashboard data
  getVendorDashboard(): Observable<VendorDashboardDto> {
    return this.http.get<VendorDashboardDto>(`${this.baseUrl}/vendor/dashboard`);
  }

  // Update product
  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/vendor/products/${id}`, product);
  }

  // Update product as admin
  updateProductAsAdmin(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/products/${id}`, product);
  }

  // Delete product
  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/vendor/products/${id}`);
  }
}
