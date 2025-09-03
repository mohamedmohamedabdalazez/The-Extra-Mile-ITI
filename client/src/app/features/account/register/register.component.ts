import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { User } from '../../../shared/models/user';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { JsonPipe } from '@angular/common';
import { TextInputComponent } from "../../../shared/components/text-input/text-input.component";

@Component({
  selector: 'app-register',
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatButton,
    TextInputComponent,
    MatRadioModule,
    RouterLink
],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snack = inject(SnackbarService);
  validationErrors: any[] = [];

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    role: ['Customer', Validators.required],
    storeName: [''] // Optional field for vendors
  })

  ngOnInit() {
    document.body.classList.add('auth-page');
    
    // Listen for role changes to show/hide store name field
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const storeNameControl = this.registerForm.get('storeName');
      if (role === 'Vendor') {
        storeNameControl?.setValidators([
          Validators.required, 
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9\s\-_]+$/) // Only letters, numbers, spaces, hyphens, and underscores
        ]);
      } else {
        storeNameControl?.clearValidators();
        storeNameControl?.setValue('');
      }
      storeNameControl?.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    document.body.classList.remove('auth-page');
  }

  onSubmit() {
    const formValue = this.registerForm.value;
    
    // Prepare registration data
    const registrationData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role,
      // Use store name as username for vendors, email for customers
      username: formValue.role === 'Vendor' ? formValue.storeName : formValue.email
    };

    this.accountService.register(registrationData).subscribe({
      next: (user: User) => {
        this.snack.success('Registration successful! Please login to continue.');
        const role = this.registerForm.value.role;
        if (role === 'Admin') {
          this.router.navigateByUrl('/admin/dashboard');
        } else {
          // Redirect all non-admin users to login page
          this.router.navigateByUrl('/account/login');
        }
      },
      error: err => this.validationErrors = err
    });
  }

  // Getter to check if vendor role is selected
  get isVendorSelected(): boolean {
    return this.registerForm.get('role')?.value === 'Vendor';
  }
}
