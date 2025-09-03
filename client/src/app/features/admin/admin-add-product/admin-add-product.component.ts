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
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { DialogService } from '../../../core/services/dialog.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { BusyService } from '../../../core/services/busy.service';

@Component({
  selector: 'app-admin-add-product',
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
    MatTooltipModule
  ],
  templateUrl: './admin-add-product.component.html',
  styleUrls: ['./admin-add-product.component.scss']
})
export class AdminAddProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private dialogService = inject(DialogService);
  private snackbar = inject(SnackbarService);
  private busyService = inject(BusyService);

  productForm!: FormGroup;
  isLoading = false;

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

  // Chart hover state
  isSalesChartExpanded = false;
  isProductStatusChartExpanded = false;

  // Drag and drop state
  isDragOver = false;
  draggedUrls: string[] = [];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      pictureUrl: ['', [Validators.required]],
      productType: ['', Validators.required],
      productBrand: ['', Validators.required],
      quantityInStock: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      // Check if we have an image
      if (this.draggedUrls.length === 0 && !this.productForm.get('pictureUrl')?.value) {
        this.snackbar.error('Please add a product image');
        return;
      }

      this.isLoading = true;
      this.busyService.busy();

      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('type', this.productForm.get('productType')?.value);
      formData.append('brand', this.productForm.get('productBrand')?.value);
      formData.append('quantityInStock', this.productForm.get('quantityInStock')?.value);

      // Handle image - if we have dragged URLs, use the first one as data URL
      if (this.draggedUrls.length > 0) {
        formData.append('pictureUrl', this.draggedUrls[0]);
      } else {
        formData.append('pictureUrl', this.productForm.get('pictureUrl')?.value || '');
      }

      // Debug: Log what's being sent
      console.log('Form values:', this.productForm.value);
      console.log('Dragged URLs:', this.draggedUrls);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      this.productService.addProductAsAdmin(formData).subscribe({
        next: (product: any) => {
          this.snackbar.success('Product added successfully!');
          this.router.navigate(['/admin/product-review', product.id]);
        },
        error: (err: any) => {
          console.error('Error adding product:', err);
          this.snackbar.error(err.message || 'Failed to add product');
        },
        complete: () => {
          this.isLoading = false;
          this.busyService.idle();
        }
      });
    } else {
      this.snackbar.error('Please fill in all required fields correctly');
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  onSalesChartMouseEnter(): void {
    this.isSalesChartExpanded = true;
  }

  onSalesChartMouseLeave(): void {
    this.isSalesChartExpanded = false;
  }

  onProductStatusChartMouseEnter(): void {
    this.isProductStatusChartExpanded = true;
  }

  onProductStatusChartMouseLeave(): void {
    this.isProductStatusChartExpanded = false;
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
      // Handle file drops - convert to URLs
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            this.draggedUrls.push(url);
            // Set the first image URL to the form
            if (this.draggedUrls.length === 1) {
              this.productForm.patchValue({ pictureUrl: url });
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }

    // Handle URL drops from text
    const text = event.dataTransfer?.getData('text');
    if (text && this.isValidImageUrl(text)) {
      this.productForm.patchValue({ pictureUrl: text });
    }
  }

  private isValidImageUrl(url: string): boolean {
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null || 
           url.startsWith('data:image/') ||
           url.startsWith('http') && url.includes('image');
  }

  removeDraggedUrl(index: number): void {
    this.draggedUrls.splice(index, 1);
    if (this.draggedUrls.length === 0) {
      this.productForm.patchValue({ pictureUrl: '' });
    } else {
      this.productForm.patchValue({ pictureUrl: this.draggedUrls[0] });
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
            // Set the first image URL to the form
            if (this.draggedUrls.length === 1) {
              this.productForm.patchValue({ pictureUrl: url });
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  }
}
