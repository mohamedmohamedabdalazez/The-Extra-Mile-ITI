import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  snackbar = inject(MatSnackBar);
  private router = inject(Router);

  error(message: string) {
    const config = this.getSnackbarConfig();
    config.panelClass = [...(config.panelClass || []), 'snack-error'];
    this.snackbar.open(message, 'Close', config);
  }

  success(message: string) {
    const config = this.getSnackbarConfig();
    config.panelClass = [...(config.panelClass || []), 'snack-success'];
    this.snackbar.open(message, 'Close', config);
  }

  private getSnackbarConfig(): MatSnackBarConfig {
    const currentUrl = this.router.url;
    const isAuthPage = currentUrl.includes('/account/login') || currentUrl.includes('/account/register');
    
    console.log('Current URL:', currentUrl, 'Is Auth Page:', isAuthPage);
    
    // All messages (unauthorized, forbidden, success) at bottom
    const config = {
      duration: 5000,
      panelClass: ['snack-bottom'],
      verticalPosition: 'bottom' as const,
      horizontalPosition: 'center' as const,
      politeness: 'polite' as const
    };
    console.log('Bottom config:', config);
    return config;
  }
}
