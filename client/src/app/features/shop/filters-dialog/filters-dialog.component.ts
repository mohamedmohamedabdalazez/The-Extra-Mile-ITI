import { Component, inject, Output, EventEmitter } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ShopParams } from '../../../shared/models/shopParams';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filters-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatSliderModule,
    MatCheckboxModule,
    CommonModule
  ],
  templateUrl: './filters-dialog.component.html',
  styleUrl: './filters-dialog.component.scss'
})
export class FiltersDialogComponent {
  shopService = inject(ShopService);
  @Output() filtersChanged = new EventEmitter<ShopParams>();
  shopParams = new ShopParams();
  sortOptions = [
    { name: 'Name A-Z', value: 'name' },
    { name: 'Name Z-A', value: 'nameDesc' },
    { name: 'Price Low to High', value: 'price' },
    { name: 'Price High to Low', value: 'priceDesc' },
  ];

  onSearch() {
    this.filtersChanged.emit(this.shopParams);
  }

  onSortChange() {
    this.filtersChanged.emit(this.shopParams);
  }

  onPriceChange() {
    this.filtersChanged.emit(this.shopParams);
  }

  onCategoryChange() {
    this.filtersChanged.emit(this.shopParams);
  }

  onSportChange() {
    this.filtersChanged.emit(this.shopParams);
  }

  onBrandChange() {
    this.filtersChanged.emit(this.shopParams);
  }

  onInStockChange() {
    this.filtersChanged.emit(this.shopParams);
  }

  clearFilters() {
    this.shopParams = new ShopParams();
    this.filtersChanged.emit(this.shopParams);
  }
}