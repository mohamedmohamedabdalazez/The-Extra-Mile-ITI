import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatDialogComponent } from '../../shared/components/chat-dialog/chat-dialog.component';
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { MatBadge } from "@angular/material/badge";
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatProgressBar } from "@angular/material/progress-bar";
import { BusyService } from '../../core/services/busy.service';
import { CartService } from '../../core/services/cart.service';
import { AccountService } from '../../core/services/account.service';
import { MatDivider } from '@angular/material/divider';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { IsAdmin } from '../../shared/directives/is-admin';
import { ThemeService } from '../../core/services/theme.service';
import { DialogService } from '../../core/services/dialog.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatButton,
    MatBadge,
    RouterLink,
    RouterLinkActive,
    MatProgressBar,
    MatMenuTrigger,
    MatMenu,
    MatDivider,
    MatMenuItem,
    MatDialogModule,
    // IsAdmin,
    FormsModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: true
})
export class HeaderComponent {
  busyService = inject(BusyService);
  cartService = inject(CartService);
  accountService = inject(AccountService);
  private router = inject(Router);
  themeService = inject(ThemeService);
  dialogService = inject(DialogService);
  snackbar = inject(SnackbarService);
  private dialog = inject(MatDialog);

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  isDarkMode() {
    return this.themeService.isDarkMode();
  }
  
  searchTerm = '';

  async logout() {
    const confirmed = await this.dialogService.confirm('Logout', 'Are you sure you want to logout?');
    if (confirmed) {
      this.busyService.busy();
      this.accountService.logout().subscribe({
        next: () => {
          this.accountService.currentUser.set(null);
          this.router.navigateByUrl('/');
          this.snackbar.success('Logged out successfully');
        },
        error: err => this.snackbar.error(err.message),
        complete: () => this.busyService.idle()
      });
    }
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigateByUrl(`/shop?search=${encodeURIComponent(this.searchTerm.trim())}`);
    }
  }

  isOnAdminDashboard(): boolean {
    return this.router.url.startsWith('/admin');
  }

  isOnAuthPage(): boolean {
    return this.router.url.includes('/account/login') || this.router.url.includes('/account/register');
  }

  shouldHideHeader(): boolean {
    return this.isOnAuthPage();
  }

  openAskAI() {
    this.dialog.open(ChatDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      height: '80vh',
      maxHeight: '90vh',
      panelClass: 'chat-dialog-panel',
      autoFocus: false
    });
  }
}
