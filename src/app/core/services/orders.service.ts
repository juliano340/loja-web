import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: number;
  total: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly apiUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  findMyOrders() {
    return this.http.get<Order[]>(`${this.apiUrl}/my`);
  }

  create(items: { productId: number; quantity: number }[]) {
    return this.http.post(this.apiUrl, { items });
  }
}
