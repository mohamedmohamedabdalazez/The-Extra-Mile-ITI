import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Cart, CartItem, Coupon } from '../../shared/models/cart';
import { DeliveryMethod } from '../../shared/models/deliveryMethod';
import { Product } from '../../shared/models/product';
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  baseUrl = environment.baseUrl;
  private http = inject(HttpClient);
  private imageService = inject(ImageService);
  cart = signal<Cart | null>(null);
  itemCount = computed(() => {
    return this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0);
  });
  selectedDelivery = signal<DeliveryMethod | null>(null);
  totals = computed(() => {
    const cart = this.cart();
    const delivery = this.selectedDelivery();

    if (!cart) return null;
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discountValue = 0;

    if (cart.coupon) {
      console.log(cart)
      if (cart.coupon.amountOff) {
        discountValue = cart.coupon.amountOff;
      } else if (cart.coupon.percentOff) {
        discountValue = subtotal * (cart.coupon.percentOff / 100);
      }
    }

    const shipping = delivery ? delivery.price : 0;

    const total = subtotal + shipping - discountValue

    return {
      subtotal,
      shipping,
      discount: discountValue,
      total
    };
  })

  applyDiscount(code: string) {
    return this.http.get<Coupon>(this.baseUrl + 'coupons/' + code);
  }

  getCart(id: string) {
    return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).pipe(
      map(cart => {
        this.cart.set(cart);
        return cart;
      })
    )
  }

  setCart(cart: Cart) {
    return this.http.post<Cart>(this.baseUrl + 'cart', cart).pipe(
      tap(cart => {
        this.cart.set(cart)
      })
    )
  }

  async addItemToCart(product: Product, quantity = 1) {
    const cart = this.cart() ?? this.createCart();
    const itemToAdd = this.mapProductToCartItem(product);
    cart.items = this.addOrUpdateItem(cart.items, itemToAdd, quantity);
    await firstValueFrom(this.setCart(cart));
  }

  async removeItemFromCart(productId: number, quantity = 1) {
    const cart = this.cart();
    if (!cart) return;

    const index = this.findCartItemIndex(cart.items, productId);

    if (index !== -1) {
      if (cart.items[index].quantity > quantity) {
        cart.items[index].quantity -= quantity;
      } else {
        cart.items.splice(index, 1);
      }
      if (cart.items.length === 0) {
        this.deleteCart();
      } else {
        await firstValueFrom(this.setCart(cart));
      }
    }
  }

  deleteCart() {
    this.http.delete(this.baseUrl + 'cart?id=' + this.cart()?.id).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      }
    });
  }

  private addOrUpdateItem(items: CartItem[], itemToAdd: CartItem, quantity: number): CartItem[] {
    const index = this.findCartItemIndex(items, itemToAdd.productId);
    if (index === -1) {
      itemToAdd.quantity = quantity;
      items.push(itemToAdd);
    } else {
      items[index].quantity += quantity;
    }
    return items;
  }

  private mapProductToCartItem(product: Product): CartItem {
    // Handle the image URL properly for cart items using ImageService
    const pictureUrl = this.imageService.getProductImageUrl(product.pictureUrl);
    
    return {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 0,
      pictureUrl: pictureUrl,
      brand: product.brand,
      type: product.type
    };
  }

  private findCartItemIndex(items: CartItem[], productId: number): number {
    return items.findIndex(i => i.productId === productId);
  }

  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }

  private createCart() {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }
}
