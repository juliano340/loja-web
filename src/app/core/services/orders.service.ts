import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface CreateOrderItem {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly apiUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  create(items: CreateOrderItem[]): Observable<any> {
    return this.http.post(this.apiUrl, { items });
  }
}
