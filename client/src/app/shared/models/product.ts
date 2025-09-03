export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  quantityInStock: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  vendorId?: string;
  vendor?: {
    id: string;
    userName: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt?: string;
  
  // Method to check if product is new (within 7 days)
  isNew?: () => boolean;
}