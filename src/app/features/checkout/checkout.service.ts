import { Injectable, signal } from '@angular/core';

export interface Address {
  name: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
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
