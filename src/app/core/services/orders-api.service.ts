import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type CreateOrderPayload = {
  shippingAddress: {
    street: string;
    number: string;
    city: string;
    state: string;
    zip: string;
  };
  couponCode?: string | null;
  items: { productId: number; quantity: number }[];
};

type CreateOrderResponse = { id: number };

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createOrder(payload: CreateOrderPayload) {
    return this.http.post<CreateOrderResponse>(`${this.baseUrl}/orders`, payload);
  }

  getOrderById(orderId: number) {
    return this.http.get<any>(`${this.baseUrl}/orders/${orderId}`);
  }
}
