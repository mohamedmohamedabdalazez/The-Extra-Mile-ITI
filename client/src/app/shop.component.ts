import { Component, OnInit } from '@angular/core';
import { IProduct } from './models';
import { ShopService } from './shop.service';
import { ShopParams } from './shop.params';
import { CommonModule } from '@angular/common';
import { PagerComponent } from './pager.component';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  standalone: true,
  imports: [CommonModule, PagerComponent]
})
export class ShopComponent implements OnInit {
  products: IProduct[];
  shopParams = new ShopParams();
  totalCount: number;

  constructor(private shopService: ShopService) { }

  ngOnInit() {
    this.getProducts();
  }

  getProducts() {
    this.shopService.getProducts(this.shopParams).subscribe(response => {
      this.products = response.data;
      this.shopParams.pageNumber = response.pageIndex;
      this.shopParams.pageSize = response.pageSize;
      this.totalCount = response.count;
    }, error => {
      console.log(error);
    });
  }

  onPageChanged(event: any) {
    this.shopParams.pageNumber = event;
    this.getProducts();
  }
}
