import { Component, HostListener, inject } from '@angular/core';
import { FloatingArrowService } from './floating-arrow.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-arrow',
  templateUrl: './floating-arrow.component.html',
  styleUrls: ['./floating-arrow.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class FloatingArrowComponent {
  arrowService = inject(FloatingArrowService);
  isScrolled = false;
  isAtBottom = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 100;

    // A small buffer is added to ensure the condition is met
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
    this.isAtBottom = atBottom;
  }

  onArrowClick() {
    if (this.isAtBottom) {
      this.scrollToTop();
    } else {
      this.scrollToFooter();
    }
  }

  private scrollToFooter() {
    const footer = document.querySelector('app-footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
