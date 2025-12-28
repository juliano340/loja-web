import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateOrderItemInput {
  productId: number;
  quantity: number;
}

export interface ShippingAddressInput {
  zip: string;
  city: string;
  state: string;
  number: string;
  street: string;
  complement?: string;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  shippingAddress: ShippingAddressInput;
  couponCode?: string;
}

export interface OrderProduct {
  id: number;
  name: string;
  description?: string | null;
  price: string;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  product: OrderProduct;
  quantity: number;
  unitPrice: string;
  productName: string;
}

export interface Order {
  id: number;
  items: OrderItem[];
  subtotal: string;
  shippingFee: string;
  total: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: ShippingAddressInput;
  paidAt: string | null;
  cancelledAt: string | null;
  couponCode: string | null;
  discountType: string | null;
  discountValue: string | null;
  discountAmount: string | null;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  create(payload: CreateOrderInput): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, payload);
  }

  findMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/my`);
  }

  findAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}/status`, { status });
  }
}
