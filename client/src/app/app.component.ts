import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./layout/header/header.component";
import { FloatingArrowService } from './shared/components/floating-arrow/floating-arrow.service';
import { FooterComponent } from './layout/footer/footer.component';
import { FloatingArrowComponent } from './shared/components/floating-arrow/floating-arrow.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet, FooterComponent, FloatingArrowComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Extra Mile';
  arrowService = inject(FloatingArrowService);
  router = inject(Router);
  showFooter = true;

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showFooter = !(event.url.includes('login') || event.url.includes('register'));
    });
  }

  ngOnInit() {
    this.arrowService.show();
  }
}
