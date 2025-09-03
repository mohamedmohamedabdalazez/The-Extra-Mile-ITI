import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// import { TextInputComponent } from '../../../shared/components/text-input/text-input.component';
import { Brand } from '../../../shared/models/brand';
import { Type } from '../../../shared/models/type';
import { ProductService } from '../../../core/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../../shared/models/product';

@Component({
  selector: 'app-vendor-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    // TextInputComponent,
  ],
  templateUrl: './vendor-product-form.component.html',
  styleUrls: ['./vendor-product-form.component.scss']
})
export class VendorProductFormComponent implements OnInit {
  isEditMode = false;
  productId: number | null = null;
  originalProductStatus: string = '';
  isSubmitting = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  // Drag and drop state
  isDragOver = false;
  draggedUrls: string[] = [];

  productForm!: FormGroup;
types: Type[] = [
  { id: 1, name: 'Shoes' },
  { id: 2, name: 'Ball' },
  { id: 3, name: 'Gloves' },
  { id: 4, name: 'Racket' },
  { id: 5, name: 'Jersey' },
  { id: 6, name: 'Shorts' },
  { id: 7, name: 'Socks' },
  { id: 8, name: 'Cap' },
  { id: 9, name: 'Bag' },
  { id: 10, name: 'Knee Pads' },
  { id: 11, name: 'Shin Guards' },
  { id: 12, name: 'Boots' },
  { id: 13, name: 'Trainers' },
  { id: 14, name: 'Dumbbells' },
  { id: 15, name: 'Kettlebell' },
  { id: 16, name: 'Barbell' },
  { id: 17, name: 'Tennis Ball' },
  { id: 18, name: 'Volleyball' },
  { id: 19, name: 'Basketball' },
  { id: 20, name: 'Soccer Ball' },
  { id: 21, name: 'Cricket Ball' },
  { id: 22, name: 'Golf Ball' },
  { id: 23, name: 'Tennis Racket' },
  { id: 24, name: 'Badminton Racket' },
  { id: 25, name: 'Table Tennis Racket' },
  { id: 26, name: 'Golf Club' },
  { id: 27, name: 'Cricket Bat' },
  { id: 28, name: 'Baseball Bat' },
  { id: 29, name: 'Hockey Stick' },
  { id: 30, name: 'Swimming Goggles' },
  { id: 31, name: 'Swimming Cap' },
  { id: 32, name: 'Swimming Trunks' },
  { id: 33, name: 'Boxing Gloves' },
  { id: 34, name: 'Boxing Shorts' },
  { id: 35, name: 'Martial Arts Gi' },
  { id: 36, name: 'Yoga Mat' },
  { id: 37, name: 'Yoga Block' },
  { id: 38, name: 'Resistance Band' },
  { id: 39, name: 'Foam Roller' },
  { id: 40, name: 'Jump Rope' }
];

  brands: Brand[] = [
    { id: 1, name: 'Nike' },
    { id: 2, name: 'Adidas' },
    { id: 3, name: 'Puma' },
    { id: 4, name: 'Under Armour' },
    { id: 5, name: 'Wilson' },
    { id: 6, name: 'Babolat' },
    { id: 7, name: 'Head' },
    { id: 8, name: 'Prince' },
    { id: 9, name: 'Yonex' },
    { id: 10, name: 'Mizuno' },
    { id: 11, name: 'Asics' },
    { id: 12, name: 'New Balance' },
    { id: 13, name: 'Reebok' },
    { id: 14, name: 'Converse' },
    { id: 15, name: 'Vans' },
    { id: 16, name: 'Jordan' },
    { id: 17, name: 'KIPSTA' },
    { id: 18, name: 'TARMAK' },
    { id: 19, name: 'Mitchell & Ness' },
    { id: 20, name: '47 Brand' },
    { id: 21, name: 'Peak' },
    { id: 22, name: 'SG' },
    { id: 23, name: 'Nivia' },
    { id: 24, name: 'FitRx' },
    { id: 25, name: 'Element Fitness' },
    { id: 26, name: 'Body Solid' },
    { id: 27, name: 'CENTR' },
    { id: 28, name: 'Inspace' },
    { id: 29, name: 'Competition' },
    { id: 30, name: 'ALLSIX' },
    { id: 31, name: 'ACTIV' },
    { id: 32, name: 'Urethane' },
    { id: 33, name: 'Fit Line' },
    { id: 34, name: 'Copa' },
    { id: 35, name: 'Predator' }
  ];
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      type: [null, Validators.required],
      brand: [null, Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProductForEdit(this.productId);
      } else {
        // Check if we have pending product data from review page
        this.loadPendingProductData();
      }
    });
  }

  loadPendingProductData(): void {
    // This method is no longer needed since we upload directly
    // Keeping it for potential future use
  }

  loadProductForEdit(productId: number): void {
    this.productService.getVendorProduct(productId).subscribe({
      next: (product: Product) => {
        // Store the original status for notification purposes
        this.originalProductStatus = product.status || '';
        
        // Find the type and brand IDs based on the names
        const typeId = this.types.find(t => t.name === product.type)?.id || null;
        const brandId = this.brands.find(b => b.name === product.brand)?.id || null;

        // Populate the form with existing product data
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          type: typeId,
          brand: brandId,
          quantity: product.quantityInStock
        });

        // Set the image preview if available
        if (product.pictureUrl) {
          this.imagePreview = product.pictureUrl;
        }
      },
      error: (error) => {
        console.error('Error loading product for edit:', error);
        alert('Error loading product data. Please try again.');
        this.router.navigate(['/vendor/products']);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        // Add to dragged URLs for consistency
        this.draggedUrls = [e.target.result];
      };
      reader.readAsDataURL(file);
    }
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
            this.imagePreview = url;
            // Set the first image URL as selected file (for compatibility)
            if (this.draggedUrls.length === 1) {
              this.selectedFile = file;
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }

    // Handle URL drops from text
    const text = event.dataTransfer?.getData('text');
    if (text && this.isValidImageUrl(text)) {
      this.draggedUrls = [text];
      this.imagePreview = text;
      this.selectedFile = null; // No file, just URL
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
      this.imagePreview = null;
      this.selectedFile = null;
    } else {
      this.imagePreview = this.draggedUrls[0];
    }
  }

  onReset(): void {
    // Reset form to initial values
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      type: null,
      brand: null,
      quantity: 0
    });

    // Clear file selection and image preview
    this.selectedFile = null;
    this.imagePreview = null;
    this.draggedUrls = [];

    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Session storage is no longer used for pending products

    console.log('Form reset successfully');
  }

  clearImagePreview(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.draggedUrls = [];
    
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit() {
    console.log('Form values:', this.productForm.value);
    console.log('Form valid:', this.productForm.valid);
    console.log('Form errors:', this.productForm.errors);
    console.log('Selected file:', this.selectedFile);
    
    // Debug individual form controls
    console.log('Name control:', this.productForm.get('name')?.value, this.productForm.get('name')?.errors);
    console.log('Type control:', this.productForm.get('type')?.value, this.productForm.get('type')?.errors);
    console.log('Brand control:', this.productForm.get('brand')?.value, this.productForm.get('brand')?.errors);
    
    if (this.productForm.invalid) {
      console.log('Form is invalid, returning');
      return;
    }

    // For edit mode, we don't require a new file if one already exists
    if (!this.isEditMode && !this.selectedFile && this.draggedUrls.length === 0) {
      console.log('No file or image URL provided for new product, returning');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.productId) {
      // Update existing product - use FormData for file upload
      const formData = new FormData();
      const productValue = this.productForm.value;

      // Map form fields to API expected field names
      formData.append('Name', productValue.name);
      formData.append('Description', productValue.description);
      formData.append('Price', productValue.price.toString());
      
      const typeName = this.getTypeName(productValue.type);
      const brandName = this.getBrandName(productValue.brand);
      
      console.log('Type ID:', productValue.type, 'Type Name:', typeName);
      console.log('Brand ID:', productValue.brand, 'Brand Name:', brandName);
      
      // Debug the type and brand lookup
      console.log('Available types:', this.types);
      console.log('Available brands:', this.brands);
      console.log('Looking for type ID:', productValue.type);
      console.log('Looking for brand ID:', productValue.brand);
      
      // Validate that Type and Brand are not empty
      if (!typeName) {
        alert('Error: Type is required but could not be found.');
        this.isSubmitting = false;
        return;
      }
      
      if (!brandName) {
        alert('Error: Brand is required but could not be found.');
        this.isSubmitting = false;
        return;
      }
      
      formData.append('Type', typeName);
      formData.append('Brand', brandName);
      formData.append('QuantityInStock', productValue.quantity.toString());

      // Append the file if a new one was selected
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      } else if (this.draggedUrls.length > 0) {
        // If we have dragged URLs, use the first one as data URL
        formData.append('PictureUrl', this.draggedUrls[0]);
      }

      this.productService.updateProduct(this.productId, formData).subscribe({
        next: (response) => {
          console.log('Product updated successfully', response);
          this.isSubmitting = false;
          // Navigate to the review page with the product ID and update flag
          this.router.navigate(['/vendor/products/review'], { 
            queryParams: { 
              productId: this.productId,
              isUpdate: 'true'
            }
          });
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.isSubmitting = false;
          alert('Error updating product. Please try again.');
        }
      });
    } else {
      // Create new product - send directly to API with file upload
      const formData = new FormData();
      const productValue = this.productForm.value;

      // Map form fields to API expected field names
      formData.append('Name', productValue.name);
      formData.append('Description', productValue.description);
      formData.append('Price', productValue.price.toString());
      
      const typeName = this.getTypeName(productValue.type);
      const brandName = this.getBrandName(productValue.brand);
      
      console.log('Type ID:', productValue.type, 'Type Name:', typeName);
      console.log('Brand ID:', productValue.brand, 'Brand Name:', brandName);
      
      // Debug the type and brand lookup
      console.log('Available types:', this.types);
      console.log('Available brands:', this.brands);
      console.log('Looking for type ID:', productValue.type);
      console.log('Looking for brand ID:', productValue.brand);
      
      // Validate that Type and Brand are not empty
      if (!typeName) {
        alert('Error: Type is required but could not be found.');
        this.isSubmitting = false;
        return;
      }
      
      if (!brandName) {
        alert('Error: Brand is required but could not be found.');
        this.isSubmitting = false;
        return;
      }
      
      formData.append('Type', typeName);
      formData.append('Brand', brandName);
      formData.append('QuantityInStock', productValue.quantity.toString());

      // Append the file
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      } else if (this.draggedUrls.length > 0) {
        // If we have dragged URLs, use the first one as data URL
        formData.append('PictureUrl', this.draggedUrls[0]);
      }

      // Log the FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key + ':', value);
      }

      // Additional debugging for Type and Brand specifically
      console.log('Type value being appended:', typeName);
      console.log('Brand value being appended:', brandName);
      console.log('Type value type:', typeof typeName);
      console.log('Brand value type:', typeof brandName);

      this.productService.addProduct(formData).subscribe({
        next: (response) => {
          console.log('Product created successfully', response);
          this.isSubmitting = false;
          // Navigate to the review page with the product ID
          if (response && response.id) {
            this.router.navigate(['/vendor/products/review'], { 
              queryParams: { productId: response.id }
            });
          } else {
            // Fallback to review page without product ID
            this.router.navigate(['/vendor/products/review']);
          }
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.isSubmitting = false;
          
          // Improved error handling
          let errorMessage = 'Error creating product. Please try again.';
          
          if (error.error) {
            if (Array.isArray(error.error)) {
              // Handle validation errors array
              errorMessage = 'Validation errors: ' + error.error.join(', ');
            } else if (typeof error.error === 'string') {
              // Handle string error message
              errorMessage = error.error;
            } else if (error.error.errors) {
              // Handle ModelState errors
              const errors = Object.values(error.error.errors).flat();
              errorMessage = 'Validation errors: ' + errors.join(', ');
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          alert(errorMessage);
        }
      });
    }
  }



  onCancel(): void {
    this.router.navigate(['/vendor/products']);
  }

  private getTypeName(typeId: number | string | null): string {
    console.log('getTypeName called with:', typeId, 'type:', typeof typeId);
    if (!typeId) {
      console.log('typeId is null/empty, returning empty string');
      return '';
    }
    const id = typeof typeId === 'string' ? parseInt(typeId, 10) : typeId;
    console.log('Parsed ID:', id);
    const type = this.types.find(t => t.id === id);
    console.log('Found type:', type);
    return type ? type.name : '';
  }

  private getBrandName(brandId: number | string | null): string {
    console.log('getBrandName called with:', brandId, 'type:', typeof brandId);
    if (!brandId) {
      console.log('brandId is null/empty, returning empty string');
      return '';
    }
    const id = typeof brandId === 'string' ? parseInt(brandId, 10) : brandId;
    console.log('Parsed ID:', id);
    const brand = this.brands.find(b => b.id === id);
    console.log('Found brand:', brand);
    return brand ? brand.name : '';
  }
}
