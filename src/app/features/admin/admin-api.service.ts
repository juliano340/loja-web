import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../core/services/products.service';
import { Category } from '../../core/services/categories.service';
import { Order } from '../../core/services/orders.service';

export type ProductPayload = {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive?: boolean;
  categoryIds: string[];
};

export type StockMovement = {
  id: number;
  productId: number;
  type: string;
  source: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private http: HttpClient) {}

  listProducts() {
    return this.http.get<Product[]>('/api/products/admin/all');
  }

  createProduct(payload: ProductPayload) {
    return this.http.post<Product>('/api/products', payload);
  }

  updateProduct(id: number, payload: Partial<ProductPayload>) {
    return this.http.patch<Product>(`/api/products/${id}`, payload);
  }

  listCategories() {
    return this.http.get<Category[]>('/api/categories');
  }

  createCategory(payload: { name: string; slug: string }) {
    return this.http.post<Category>('/api/categories', payload);
  }

  getInventory(productId: number) {
    return this.http.get<number>(`/api/admin/inventory/${productId}`);
  }

  adjustStock(productId: number, delta: number, note?: string) {
    return this.http.post<{ newQuantity: number }>(`/api/admin/inventory/${productId}/adjust`, {
      delta,
      note,
    });
  }

  getMovements(productId: number) {
    return this.http.get<StockMovement[]>(`/api/admin/inventory/${productId}/movements`);
  }

  listOrders() {
    return this.http.get<Order[]>('/api/orders');
  }

  updateOrderStatus(id: number, status: string) {
    return this.http.patch<Order>(`/api/orders/${id}/status`, { status });
  }

  cancelExpiredOrders() {
    return this.http.post<number>('/api/orders/cancel-expired', {});
  }
}
