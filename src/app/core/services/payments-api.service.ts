import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type CheckoutSessionResponse = { url: string; sessionId: string };

@Injectable({ providedIn: 'root' })
export class PaymentsApiService {
  private baseUrl = '/api'; // ✅ direto

  constructor(private http: HttpClient) {}

  createCheckoutSession(orderId: number) {
    return this.http.post<{ url: string; sessionId: string }>(
      `${this.baseUrl}/payments/checkout-session`,
      { orderId }
    );
  }
}
