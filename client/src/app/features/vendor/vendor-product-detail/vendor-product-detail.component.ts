import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { StatusHistory } from '../../../shared/models/status-history';
import { ProductService } from '../../../core/services/product.service';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-vendor-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './vendor-product-detail.component.html',
  styleUrls: ['./vendor-product-detail.component.scss']
})
export class VendorProductDetailComponent implements OnInit {
  product?: Product;
  statusHistory: StatusHistory[] = [];
  imageUrl: string | null = null;
  imageError: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private imageService = inject(ImageService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getVendorProduct(+id).subscribe({
        next: (product: Product) => {
          this.product = product;
          
          // Handle the image URL properly
          if (product.pictureUrl) {
            console.log('Original pictureUrl from API:', product.pictureUrl);
            this.imageUrl = this.imageService.getProductImageUrl(product.pictureUrl);
            console.log('Constructed image URL:', this.imageUrl);
          } else {
            // Use a default placeholder image if no product image is available
            this.imageUrl = this.imageService.getPlaceholderImageUrl();
            console.log('No pictureUrl found, using placeholder');
          }
          
          // Generate status history based on current product status
          this.statusHistory = [
            { status: 'Submitted', date: new Date(), notes: 'Initial submission by vendor.' },
            { status: 'Pending', date: new Date(), notes: 'Product is under review by the admin team.' }
          ];
          
          // Add current status to history if it's not Pending
          if (product.status && product.status !== 'Pending') {
            const currentStatusNotes = this.getStatusNotes(product.status);
            this.statusHistory.push({ 
              status: product.status, 
              date: new Date(), 
              notes: currentStatusNotes 
            });
          }
        },
        error: (error) => {
          console.error('Error loading product:', error);
          // Handle error - could redirect to products list or show error message
        }
      });
    }
  }

  onEditProduct(): void {
    if (this.product) {
      this.router.navigate(['/vendor/products', this.product.id, 'edit']);
    }
  }

  onSubmitForReview(): void {
    if (this.product) {
      // Navigate to the vendor products list
      this.router.navigate(['/vendor/products']);
    }
  }



  onImageError(event: any): void {
    console.error('Image failed to load:', event);
    console.log('Failed image URL:', this.imageUrl);
    
    // Use placeholder image when image fails to load
    event.target.src = this.imageService.getPlaceholderImageUrl();
  }

  onImageLoad(event: any): void {
    console.log('Image loaded successfully:', event);
    this.imageError = false;
  }

  private getStatusNotes(status: string): string {
    switch (status) {
      case 'Approved':
        return 'Product has been approved and is now available in the shop.';
      case 'Rejected':
        return 'Product has been rejected by admin. Please review and resubmit.';
      case 'Suspended':
        return 'Product has been suspended by admin. Contact support for details.';
      default:
        return 'Status updated by admin.';
    }
  }
}
