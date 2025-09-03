import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { AdminService } from '../../../core/services/admin.service';
import { DialogService } from '../../../core/services/dialog.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { BusyService } from '../../../core/services/busy.service';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-admin-product-review',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './admin-product-review.component.html',
  styleUrls: ['./admin-product-review.component.scss']
})
export class AdminProductReviewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialogService = inject(DialogService);
  private snackbar = inject(SnackbarService);
  private busyService = inject(BusyService);
  private imageService = inject(ImageService);

  productForm!: FormGroup;
  product: any = null;
  isLoading = false;
  isSaving = false;
  isPublishing = false;

  // Product types and brands for the select dropdowns
  productTypes = [
    'Sports Equipment',
    'Fitness Gear',
    'Athletic Wear',
    'Training Accessories',
    'Outdoor Equipment',
    'Team Sports',
    'Individual Sports',
    'Wellness Products'
  ];

  productBrands = [
    'Nike',
    'Adidas',
    'Under Armour',
    'Puma',
    'Reebok',
    'New Balance',
    'ASICS',
    'ExtraMile',
    'Generic',
    'Premium'
  ];

  // Drag and drop state
  isDragOver = false;
  draggedUrls: string[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadProduct();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      pictureUrl: ['', [Validators.required]],
      productType: ['', Validators.required],
      productBrand: ['', Validators.required],
      quantityInStock: ['', [Validators.required, Validators.min(0)]]
    });
  }

  private loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isLoading = true;
      this.productService.getProduct(parseInt(productId)).subscribe({
        next: (product: any) => {
          this.product = product;
          
          // Handle the image URL properly using ImageService
          if (product.pictureUrl) {
            this.product.pictureUrl = this.imageService.getProductImageUrl(product.pictureUrl);
          }
          
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            price: product.price,
            pictureUrl: product.pictureUrl,
            productType: product.productType,
            productBrand: product.productBrand,
            quantityInStock: product.quantityInStock
          });
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading product:', err);
          this.snackbar.error('Failed to load product');
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.saveProduct();
    } else {
      this.snackbar.error('Please fill in all required fields correctly');
    }
  }

  private async saveProduct(): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      'Save Changes',
      'Are you sure you want to save the changes to this product?'
    );

    if (confirmed) {
      this.isSaving = true;
      this.busyService.busy();

      const productData = {
        name: this.productForm.get('name')?.value,
        description: this.productForm.get('description')?.value,
        price: this.productForm.get('price')?.value,
        type: this.productForm.get('productType')?.value,
        brand: this.productForm.get('productBrand')?.value,
        quantityInStock: this.productForm.get('quantityInStock')?.value,
        pictureUrl: this.productForm.get('pictureUrl')?.value
      };

      this.productService.updateProductAsAdmin(this.product.id, productData).subscribe({
        next: (product: any) => {
          this.snackbar.success('Product updated successfully!');
          this.product = product;
          this.isSaving = false;
          this.busyService.idle();
        },
        error: (err: any) => {
          console.error('Error updating product:', err);
          this.snackbar.error(err.message || 'Failed to update product');
          this.isSaving = false;
          this.busyService.idle();
        }
      });
    }
  }

  async publishProduct(): Promise<void> {
    const confirmed = await this.dialogService.confirm(
      'Publish Product',
      'Are you sure you want to publish this product to the user shop? This will make it visible to customers.'
    );

    if (confirmed) {
      this.isPublishing = true;
      this.busyService.busy();

      this.adminService.approveProduct(this.product.id).subscribe({
        next: (product: any) => {
          this.snackbar.success('Product published successfully!');
          this.product = product;
          this.isPublishing = false;
          this.busyService.idle();
        },
        error: (err: any) => {
          console.error('Error publishing product:', err);
          this.snackbar.error(err.message || 'Failed to publish product');
          this.isPublishing = false;
          this.busyService.idle();
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }

  // Drag and drop methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            this.draggedUrls.push(url);
            if (this.draggedUrls.length === 1) {
              this.productForm.patchValue({ pictureUrl: url });
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            this.draggedUrls.push(url);
            if (this.draggedUrls.length === 1) {
              this.productForm.patchValue({ pictureUrl: url });
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
    event.target.value = '';
  }

  removeDraggedUrl(index: number): void {
    this.draggedUrls.splice(index, 1);
    if (this.draggedUrls.length === 0) {
      this.productForm.patchValue({ pictureUrl: '' });
    } else {
      this.productForm.patchValue({ pictureUrl: this.draggedUrls[0] });
    }
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
}
