import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../../shared/models/cart';
import { RouterLink } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { MatButton } from '@angular/material/button';
import { Product } from '../../../shared/models/product';

@Component({
  selector: 'app-cart-item',
  imports: [
    RouterLink,
    MatIcon,
    CurrencyPipe,
    MatButton
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  cartService = inject(CartService);
  item = input.required<CartItem>();

  incrementQuantity() {
    const { productId, productName, price, pictureUrl, brand, type } = this.item();
    const product: Product = { 
      id: productId, 
      name: productName, 
      description: '', 
      price, 
      pictureUrl, 
      brand, 
      type, 
      quantityInStock: 0, 
      status: 'Pending' 
    };
    this.cartService.addItemToCart(product);
  }

  decrementQuantity() {
    const { productId } = this.item();
    this.cartService.removeItemFromCart(productId);
  }

  removeItemFromCart() {
    const { productId, quantity } = this.item();
    this.cartService.removeItemFromCart(productId, quantity);
  }
}
