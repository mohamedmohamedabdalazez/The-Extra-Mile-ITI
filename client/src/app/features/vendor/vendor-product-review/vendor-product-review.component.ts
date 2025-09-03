import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/product';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-vendor-product-review',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './vendor-product-review.component.html',
  styleUrls: ['./vendor-product-review.component.scss']
})
export class VendorProductReviewComponent implements OnInit {
  productData: any = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  isUpdateMode = false; // Add flag to track if we're reviewing an update

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private imageService = inject(ImageService);

  ngOnInit(): void {
    // Check if we have a product ID from query params (coming from product creation or update)
    const productId = this.route.snapshot.queryParamMap.get('productId');
    const isUpdate = this.route.snapshot.queryParamMap.get('isUpdate');
    
    // Set update mode flag
    this.isUpdateMode = isUpdate === 'true';
    
    if (productId) {
      // Load the created/updated product for review
      this.loadProductForReview(+productId);
    } else {
      // Check for pending product in session storage (old flow)
      const pendingProduct = sessionStorage.getItem('pendingProduct');
      if (pendingProduct) {
        const data = JSON.parse(pendingProduct);
        this.productData = data.formData;
        this.imagePreview = data.file;
      } else {
        // No pending product, redirect back to form
        this.router.navigate(['/vendor/products/new']);
      }
    }
  }

  getTypeName(typeValue: any): string {
    // If it's already a string (from API), return it directly
    if (typeof typeValue === 'string') {
      return typeValue;
    }
    // If it's a number (ID), try to find the name
    if (typeof typeValue === 'number') {
      const types = [{id: 1, name: 'Type 1'}, {id: 2, name: 'Type 2'}];
      return types.find(t => t.id === typeValue)?.name || 'Unknown';
    }
    return 'Unknown';
  }

  getBrandName(brandValue: any): string {
    // If it's already a string (from API), return it directly
    if (typeof brandValue === 'string') {
      return brandValue;
    }
    // If it's a number (ID), try to find the name
    if (typeof brandValue === 'number') {
      const brands = [{id: 1, name: 'Brand 1'}, {id: 2, name: 'Brand 2'}];
      return brands.find(b => b.id === brandValue)?.name || 'Unknown';
    }
    return 'Unknown';
  }

  loadProductForReview(productId: number): void {
    this.productService.getVendorProduct(productId).subscribe({
      next: (product: Product) => {
        // Convert the product data to the format expected by the review component
        this.productData = {
          name: product.name,
          description: product.description,
          price: product.price,
          type: product.type,
          brand: product.brand,
          quantity: product.quantityInStock
        };
        
        // Handle the image URL properly
        if (product.pictureUrl) {
          console.log('Original pictureUrl from API:', product.pictureUrl);
          this.imagePreview = this.imageService.getProductImageUrl(product.pictureUrl);
          console.log('Constructed image URL:', this.imagePreview);
        } else {
          this.imagePreview = null;
          console.log('No pictureUrl found in product data');
        }
        
        console.log('Product loaded for review:', product);
        console.log('Final image preview URL:', this.imagePreview);
      },
      error: (error) => {
        console.error('Error loading product for review:', error);
        alert('Error loading product data. Please try again.');
        this.router.navigate(['/vendor/products']);
      }
    });
  }

  onEdit(): void {
    // Check if we're reviewing an existing product
    const productId = this.route.snapshot.queryParamMap.get('productId');
    
    if (productId) {
      // Navigate to edit the existing product
      this.router.navigate(['/vendor/products', productId, 'edit']);
    } else {
      // Keep the current data in session storage and navigate back to form
      this.router.navigate(['/vendor/products/new']);
    }
  }

  onPublish(): void {
    if (!this.productData) return;

    this.isSubmitting = true;

    // Check if we're reviewing an existing product
    const productId = this.route.snapshot.queryParamMap.get('productId');
    
    if (productId) {
      if (this.isUpdateMode) {
        // We're reviewing an updated product - show success message and navigate to product details
        console.log('Product updated successfully');
        alert('Product updated successfully! It is now pending admin review.');
        this.router.navigate(['/vendor/products', productId]);
      } else {
        // We're reviewing a newly created product - show success message and navigate to product details
        console.log('Product submitted for review successfully');
        alert('Product submitted for review successfully!');
        this.router.navigate(['/vendor/products', productId]);
      }
    } else {
      // We're creating a new product (old flow)
      // Create a JSON object instead of FormData for now
      // This assumes your API can handle JSON with a base64 image string
      const productPayload = {
        name: this.productData.name,
        description: this.productData.description,
        price: this.productData.price,
        type: this.getTypeName(this.productData.type),
        brand: this.getBrandName(this.productData.brand),
        quantityInStock: this.productData.quantity,
        pictureUrl: this.imagePreview // Send the base64 string directly
      };

      this.productService.addProduct(productPayload).subscribe({
        next: (response) => {
          console.log('Product published successfully', response);
          sessionStorage.removeItem('pendingProduct');
          
          // Show success message
          alert('Product published successfully! It is now pending admin review.');
          
          // Navigate to products page to see the new product
          this.router.navigate(['/vendor/products']);
        },
        error: (error) => {
          console.error('Error publishing product:', error);
          this.isSubmitting = false;
          alert('Error publishing product. Please try again.');
        }
      });
    }
  }

  onCancel(): void {
    // Check if we're reviewing an existing product
    const productId = this.route.snapshot.queryParamMap.get('productId');
    
    if (productId) {
      // Navigate back to the product details
      this.router.navigate(['/vendor/products', productId]);
    } else {
      // Remove pending product and navigate to products list
      sessionStorage.removeItem('pendingProduct');
      this.router.navigate(['/vendor/products']);
    }
  }

  onImageError(event: any): void {
    console.error('Image failed to load:', event);
    console.log('Failed image URL:', this.imagePreview);
    
    // Use placeholder image when image fails to load
    event.target.src = this.imageService.getPlaceholderImageUrl();
  }

  onImageLoad(event: any): void {
    console.log('Image loaded successfully:', event);
  }
}
