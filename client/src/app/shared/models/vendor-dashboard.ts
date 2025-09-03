import { Product } from './product';

export interface VendorDashboardDto {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  products: Product[];
}
