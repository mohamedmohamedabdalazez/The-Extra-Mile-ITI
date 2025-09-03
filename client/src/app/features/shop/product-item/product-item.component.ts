import { Component, inject, Input, OnInit } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-product-item',
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent implements OnInit {
 @Input() product?: Product;
 cartService = inject(CartService);
 private imageService = inject(ImageService);

 ngOnInit(): void {
   // Handle the image URL properly for display using ImageService
   if (this.product?.pictureUrl) {
     this.product.pictureUrl = this.imageService.getProductImageUrl(this.product.pictureUrl);
   }
 }

 /**
  * Checks if the product is new (created within the last 7 days)
  */
 isProductNew(): boolean {
   if (!this.product?.createdAt) return false;
   
   const createdAt = new Date(this.product.createdAt);
   const sevenDaysAgo = new Date();
   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
   
   return createdAt >= sevenDaysAgo;
 }

 getProductRating(): number {
   if (!this.product) return 0;
   // Use product ID to consistently generate the same rating
   const ratingVariation = (this.product.id % 6) * 0.25; // 0, 0.25, 0.5, 0.75, 1.0, 1.25
   return 3.5 + ratingVariation; // Rating between 3.5-4.75
 }

 /**
  * Gets the vendor name for the product
  * Returns the store name (username) from the product data
  */
 getVendorName(): string {
   if (!this.product) return 'Extra Mile';
   
   // If vendor information is available, use it
   if (this.product.vendor) {
     // Prioritize userName (store name) over personal name
     if (this.product.vendor.userName && !this.product.vendor.userName.includes('@')) {
       return this.product.vendor.userName;
     } else if (this.product.vendor.firstName && this.product.vendor.lastName) {
       return `${this.product.vendor.firstName} ${this.product.vendor.lastName}`;
     } else if (this.product.vendor.firstName) {
       return this.product.vendor.firstName;
     } else if (this.product.vendor.lastName) {
       return this.product.vendor.lastName;
     }
   }
   
   // Fallback to Extra Mile for admin products (when vendorId is ExtraMile)
   if (this.product.vendorId && this.product.vendorId.includes('ExtraMile')) {
     return 'Extra Mile';
   }
   
   // Default fallback
   return 'Extra Mile';
 }

}
