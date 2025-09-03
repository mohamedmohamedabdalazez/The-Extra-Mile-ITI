import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FloatingArrowService {
  private isVisible = signal(false);

  get visible() {
    return this.isVisible.asReadonly();
  }

  show() {
    this.isVisible.set(true);
  }

  hide() {
    this.isVisible.set(false);
  }
}
