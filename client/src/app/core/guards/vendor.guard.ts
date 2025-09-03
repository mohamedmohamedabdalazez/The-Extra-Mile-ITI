import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { SnackbarService } from '../services/snackbar.service';

export const vendorGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const snack = inject(SnackbarService);

  if (accountService.isVendor()) {
    return true;
  } else {
    snack.error('You are not authorized to access this area.');
    router.navigate(['/shop']);
    return false;
  }
};
