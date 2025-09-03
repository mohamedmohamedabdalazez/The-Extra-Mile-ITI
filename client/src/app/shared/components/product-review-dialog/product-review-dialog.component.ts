import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Product } from '../../../shared/models/product';
import { ImageService } from '../../../core/services/image.service';

export interface ProductReviewDialogData {
  product: Product;
}

@Component({
  selector: 'app-product-review-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './product-review-dialog.component.html',
  styleUrls: ['./product-review-dialog.component.scss']
})
export class ProductReviewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProductReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductReviewDialogData,
    private imageService: ImageService
  ) {
    // Construct the proper image URL using ImageService
    if (this.data.product.pictureUrl) {
      this.data.product.pictureUrl = this.imageService.getProductImageUrl(this.data.product.pictureUrl);
    }
  }

  onApprove(): void {
    this.dialogRef.close('approve');
  }

  onReject(): void {
    this.dialogRef.close('reject');
  }

  onCancel(): void {
    this.dialogRef.close('cancel');
  }

  getProductStatusColor(status: string): string {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      case 'Suspended': return 'error';
      default: return 'default';
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getVendorName(product: Product): string {
    return product.vendorId || 'ExtraMile';
  }

  onImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
}
