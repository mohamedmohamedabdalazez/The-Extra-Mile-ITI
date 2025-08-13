import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pager',
  template: `
    <ul class="pagination">
      <li class="page-item" [class.disabled]="currentPage === 1">
        <a class="page-link" (click)="onPageChange(currentPage - 1)">Previous</a>
      </li>
      <li class="page-item" *ngFor="let page of pages" [class.active]="page === currentPage">
        <a class="page-link" (click)="onPageChange(page)">{{page}}</a>
      </li>
      <li class="page-item" [class.disabled]="currentPage === totalPages">
        <a class="page-link" (click)="onPageChange(currentPage + 1)">Next</a>
      </li>
    </ul>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class PagerComponent {
  @Input() totalCount: number;
  @Input() pageSize: number;
  @Output() pageChanged = new EventEmitter<number>();

  currentPage = 1;
  totalPages: number;
  pages: number[] = [];

  ngOnChanges() {
    if (this.totalCount && this.pageSize) {
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
    }
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChanged.emit(page);
    }
  }
}
