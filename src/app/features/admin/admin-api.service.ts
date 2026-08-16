import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../core/services/products.service';
import { Category } from '../../core/services/categories.service';
import { Order } from '../../core/services/orders.service';

export type ProductPayload = {
  name: string;
  sku?: string;
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

export type DashboardKpis = {
  revenue: string;
  pendingOrders: number;
  paidToday: number;
  lowStockCount: number;
  activeProducts: number;
};

export type Coupon = {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: string;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  maxRedemptions: number | null;
  maxRedemptionsPerUser: number | null;
  minSubtotal: string | null;
  maxDiscount: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CouponPayload = {
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: string;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number | null;
  minSubtotal?: string | null;
  maxDiscount?: string | null;
};

export type CategoryPayload = {
  name: string;
  slug?: string;
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

  getDashboard() {
    return this.http.get<DashboardKpis>('/api/admin/dashboard');
  }

  listCategories() {
    return this.http.get<Category[]>('/api/categories');
  }

  createCategory(payload: CategoryPayload) {
    return this.http.post<Category>('/api/categories', payload);
  }

  updateCategory(id: string, payload: CategoryPayload) {
    return this.http.patch<Category>(`/api/categories/${id}`, payload);
  }

  deleteCategory(id: string) {
    return this.http.delete<{ ok: boolean }>(`/api/categories/${id}`);
  }

  listCoupons() {
    return this.http.get<Coupon[]>('/api/coupons');
  }

  createCoupon(payload: CouponPayload) {
    return this.http.post<Coupon>('/api/coupons', payload);
  }

  updateCoupon(id: number, payload: Partial<CouponPayload>) {
    return this.http.patch<Coupon>(`/api/coupons/${id}`, payload);
  }

  deleteCoupon(id: number) {
    return this.http.delete<{ ok: boolean }>(`/api/coupons/${id}`);
  }
}
