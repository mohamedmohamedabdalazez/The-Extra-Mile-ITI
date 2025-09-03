import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { Subject, takeUntil } from 'rxjs';

import { ShopService } from '../../core/services/shop.service';
import { AccountService } from '../../core/services/account.service';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';
import { ShopParams } from '../../shared/models/shopParams';

import { ProductItemComponent } from './product-item/product-item.component';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductItemComponent,
    EmptyStateComponent,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatListModule
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, OnDestroy {
  @ViewChild('search') searchTerm?: ElementRef;
  products: Pagination<Product> = { pageIndex: 0, pageSize: 0, count: 0, data: [] };
  unfilteredPageProducts: Product[] = [];
  brands: string[] = [];
  types: string[] = [];
  sortOptions = [
    { name: 'Newest First', value: 'newest' },
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price: Low-High', value: 'priceAsc' },
    { name: 'Price: High-Low', value: 'priceDesc' },
  ];
  pageSizeOptions = [5, 10, 15, 20];
  priceValue = 0;

  private destroy$ = new Subject<void>();
  private refreshInterval: any = null;

  constructor(
    private shopService: ShopService, 
    private dialog: MatDialog,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.getBrands();
    this.getTypes();
    
    // Start auto-refresh for authenticated users only
    // this.startAutoRefresh(); // Disabled auto-refresh
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoRefresh();
  }

  private startAutoRefresh(): void {
    // Check if user is authenticated
    if (this.accountService.currentUser()) {
      console.log('Auto-refresh started for authenticated user');
      
      // Refresh every 60 seconds
      this.refreshInterval = setInterval(() => {
        console.log('Auto-refreshing shop data...');
        this.getProducts();
      }, 60000); // 60 seconds
    } else {
      console.log('No auto-refresh for anonymous user');
    }
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('Auto-refresh stopped');
    }
  }

  get shopParams(): ShopParams {
    return this.shopService.getShopParams();
  }

  getProducts(): void {
    this.shopService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Pagination<Product>) => {
          this.products = response;
          if (response) {
            this.unfilteredPageProducts = [...response.data];
            this.applyPriceFilter();
          }
        },
        error: (error: any) => console.error(error)
      });
  }

  getBrands(): void {
    this.shopService.getBrands()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (brands: string[]) => this.brands = brands,
        error: (error: any) => console.error(error)
      });
  }

  getTypes(): void {
    this.shopService.getTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types: string[]) => this.types = types,
        error: (error: any) => console.error(error)
      });
  }

  onBrandSelected(brand: string): void {
    const params = this.shopService.getShopParams();
    if (params.brands.includes(brand)) {
      params.brands = params.brands.filter((b: string) => b !== brand);
    } else {
      params.brands.push(brand);
    }
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onTypeSelected(type: string): void {
    const params = this.shopService.getShopParams();
    if (params.types.includes(type)) {
      params.types = params.types.filter((t: string) => t !== type);
    } else {
      params.types.push(type);
    }
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onSortSelected(event: MatSelectChange): void {
    const params = this.shopService.getShopParams();
    params.sort = event.value;
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onSortSelectedFromMenu(event: MatSelectionListChange): void {
    const params = this.shopService.getShopParams();
    params.sort = event.options[0].value;
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onPageChanged(event: PageEvent): void {
    const params = this.shopService.getShopParams();
    if (params.pageNumber !== event.pageIndex + 1 || params.pageSize !== event.pageSize) {
      params.pageNumber = event.pageIndex + 1;
      params.pageSize = event.pageSize;
      this.shopService.setShopParams(params);
      this.getProducts();
    }
  }

  onSearch(): void {
    const params = this.shopService.getShopParams();
    params.pageNumber = 1;
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onResetSearch(): void {
    const params = this.shopService.getShopParams();
    params.search = '';
    this.shopService.setShopParams(params);
    this.getProducts();
  }

  onReset(): void {
    const params = new ShopParams();
    this.shopService.setShopParams(params);
    if (this.searchTerm) this.searchTerm.nativeElement.value = '';
    this.priceValue = 0;
    const slider = document.getElementById('priceRange') as HTMLInputElement;
    if (slider) {
      slider.style.setProperty('--slider-fill-width', '0%');
    }
    this.getProducts();
  }

  openFiltersDialog(): void {
    const dialogRef = this.dialog.open(FiltersDialogComponent, {
      width: '80%',
      maxWidth: '400px',
      data: {
        brands: this.brands,
        types: this.types,
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const params = this.shopService.getShopParams();
        params.pageNumber = 1;
        params.types = result.selectedTypes;
        params.brands = result.selectedBrands;
        this.shopService.setShopParams(params);
        this.getProducts();
      }
    });
  }

  isTypeSelected(type: string): boolean {
    return this.shopParams.types.includes(type);
  }

  isBrandSelected(brand: string): boolean {
    return this.shopParams.brands.includes(brand);
  }

  getStartItemIndex(): number {
    return (this.shopParams.pageNumber - 1) * this.shopParams.pageSize + 1;
  }

  getEndItemIndex(): number {
    const end = this.shopParams.pageNumber * this.shopParams.pageSize;
    return end > this.products.count ? this.products.count : end;
  }

  onPriceInputChange(event: any): void {
    const value = event.target.value;
    this.priceValue = value;
    const percent = (value / 500) * 100;
    event.target.style.setProperty('--slider-fill-width', `${percent}%`);
    this.applyPriceFilter();
  }

  applyPriceFilter(): void {
    if (this.products) {
      if (this.priceValue > 0) {
        this.products.data = this.unfilteredPageProducts.filter(p => p.price <= this.priceValue);
      } else {
        this.products.data = [...this.unfilteredPageProducts];
      }
    }
  }
}
