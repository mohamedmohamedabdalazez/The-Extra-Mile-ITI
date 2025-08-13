import { Component, Input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { MatIcon } from '@angular/material/icon';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [
    MatIcon,
    CurrencyPipe,
    PercentPipe,
    CommonModule
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
  @Input() product?: Product;
}