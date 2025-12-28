import { Injectable, signal } from '@angular/core';

export interface Address {
  name?: string; // UX
  zip: string;
  street: string;
  number: string;
  city: string;
  state: string;
  complement?: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  step = signal<1 | 2 | 3>(1);

  address = signal<Address | null>(null);
  paymentMethod = signal<'pix' | 'card' | 'cash' | null>(null);

  couponCode = signal<string>('');

  nextStep() {
    const s = this.step();
    if (s === 1) this.step.set(2);
    else if (s === 2) this.step.set(3);
  }

  previousStep() {
    const s = this.step();
    if (s === 3) this.step.set(2);
    else if (s === 2) this.step.set(1);
  }

  goTo(step: 1 | 2 | 3) {
    this.step.set(step);
  }

  reset() {
    this.step.set(1);
    this.address.set(null);
    this.paymentMethod.set(null);
    this.couponCode.set('');
  }
}
