import { HttpClient, HttpParams } from '@angular/common/http';
import { map, of, tap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '../../shared/models/pagination';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  baseUrl = environment.baseUrl;
  private http = inject(HttpClient);
  types: string[] = [];
  brands: string[] = [];
  shopParams = new ShopParams();

  getProducts() {
    let params = new HttpParams();

    if (this.shopParams.brands.length > 0) {
      params = params.append('brands', this.shopParams.brands.join(','));
    }

    if (this.shopParams.types.length > 0) {
      params = params.append('types', this.shopParams.types.join(','));
    }

    if (this.shopParams.sort) {
      params = params.append('sort', this.shopParams.sort)
    }

    if (this.shopParams.search) {
      params = params.append('search', this.shopParams.search)
    }

    params = params.append('pageSize', this.shopParams.pageSize);
    params = params.append('pageIndex', this.shopParams.pageNumber);

    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', { params });
  }

  setShopParams(params: ShopParams) {
    this.shopParams = params;
  }

  getShopParams() {
    return this.shopParams;
  }

  getProduct(id: number) {
    return this.http.get<Product>(this.baseUrl + 'products/' + id);
  }

  getBrands() {
    if (this.brands.length > 0) return of(this.brands);
    return this.http.get<string[]>(this.baseUrl + 'products/brands').pipe(
      tap(brands => this.brands = brands)
    );
  }

  getTypes() {
    if (this.types.length > 0) return of(this.types);
    return this.http.get<string[]>(this.baseUrl + 'products/types').pipe(
      tap(types => this.types = types)
    );
  }

}
