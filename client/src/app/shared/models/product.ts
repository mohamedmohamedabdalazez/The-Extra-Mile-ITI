export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  pictureUrl: string;
  type: string;
  brand: string;
  quantityInStock: number;
  rating?: number;
  reviews?: number;
  isNew: boolean;
  onSale: boolean;
  isOutOfStock: boolean;
}