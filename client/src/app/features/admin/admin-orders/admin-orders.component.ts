import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../shared/models/order';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { OrderParams } from '../../../shared/models/orderParams';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatLabel, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { DialogService } from '../../../core/services/dialog.service';
import { AdminOrderDetailsComponent } from '../admin-order-details/admin-order-details.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatLabel,
    MatDialogModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
    NgClass
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialogService = inject(DialogService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['id', 'buyerEmail', 'orderDate', 'total', 'status', 'actions'];
  dataSource = new MatTableDataSource<Order>([]);
  orderParams = new OrderParams();
  totalItems = 0;
  statusOptions = ['All', 'PaymentReceived', 'PaymentMismatch', 'Refunded', 'Pending'];
  isLoading = false;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.adminService.getOrders(this.orderParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data;
          this.totalItems = response.count;
        } else {
          console.error('Invalid response data', response);
        }
        this.isLoading = false;
      },
      error: err => {
        console.error('Error fetching orders', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.orderParams.pageNumber = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;
    this.loadOrders();
  }

  onFilterSelect(event: MatSelectChange) {
    this.orderParams.filter = event.value;
    this.orderParams.pageNumber = 1;
    this.loadOrders();
  }

  async openConfirmDialog(id: number) {
    const confirmed = await this.dialogService.confirm(
      'Confirm refund',
      'Are you sure you want to issue this refund? This cannot be undone'
    );

    if (confirmed) {
      this.refundOrder(id);
    }
  }

  refundOrder(id: number): void {
    this.adminService.refundOrder(id).subscribe({
      next: order => {
        this.dataSource.data = this.dataSource.data.map(o => o.id === id ? order : o);
      },
      error: err => {
        console.error('Error refunding order:', err);
      }
    });
  }

  viewOrderDetails(order: Order): void {
    this.dialog.open(AdminOrderDetailsComponent, {
      data: order,
      width: '800px',
      maxHeight: '90vh'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PaymentReceived':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'PaymentMismatch':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }
}
