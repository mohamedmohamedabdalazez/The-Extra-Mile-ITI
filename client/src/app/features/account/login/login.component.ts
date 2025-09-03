import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatCard, MatFormField, MatInput, MatButton, MatLabel, MatError, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private snackbar = inject(SnackbarService);
  returnUrl = '/shop';
  isLoading = false;

  constructor() {
    const url = this.activatedRoute.snapshot.queryParams['returnUrl'];
    if (url) this.returnUrl = url;
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  })

  ngOnInit() {
    document.body.classList.add('auth-page');
  }

  ngOnDestroy() {
    document.body.classList.remove('auth-page');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      console.log('Attempting login with:', this.loginForm.value);
      
      this.accountService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.accountService.getUserInfo().subscribe(user => {
            console.log('User info retrieved:', user);
            if (user) {
              const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;
              console.log('User role:', role);
              if (role === 'Admin') {
                this.router.navigateByUrl('/admin/dashboard');
              } else if (role === 'Vendor') {
                this.router.navigateByUrl('/vendor/dashboard');
              } else {
                this.router.navigateByUrl(this.returnUrl);
              }
            } else {
              this.router.navigateByUrl(this.returnUrl);
            }
            this.isLoading = false;
          });
        },
        error: (error) => {
          console.error('Login error:', error);
          this.snackbar.error('Login failed. Please check your email/username and password.');
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form validation failed:', this.loginForm.errors);
      this.snackbar.error('Please fill in all required fields correctly.');
    }
  }
}
