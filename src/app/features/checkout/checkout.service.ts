import { Injectable, signal } from '@angular/core';

export interface Address {
  // UX (não vai pro backend)
  name?: string;

  // Backend (ShippingAddressDto)
  zip: string;
  street: string;
  number: string;
  city: string;
  state: string; // 2 letras
  complement?: string; // ✅ agora pode enviar
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  step = signal<1 | 2>(1);

  address = signal<Address | null>(null);
  paymentMethod = signal<'pix' | 'card' | 'cash' | null>(null);

  nextStep() {
    this.step.set(2);
  }

  previousStep() {
    this.step.set(1);
  }

  reset() {
    this.step.set(1);
    this.address.set(null);
    this.paymentMethod.set(null);
  }
}
