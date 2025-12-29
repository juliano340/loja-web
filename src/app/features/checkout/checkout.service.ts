import { Injectable, signal } from '@angular/core';
import { effect } from '@angular/core';

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
  private readonly ADDRESS_STORAGE_KEY = 'checkout.address.v1';
  constructor() {
    // 1) carrega do storage (se existir)
    try {
      const raw = localStorage.getItem(this.ADDRESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Address;
        this.address.set(parsed);
      }
    } catch {
      // se o JSON estiver ruim, só limpa pra não quebrar o app
      localStorage.removeItem(this.ADDRESS_STORAGE_KEY);
    }

    // 2) sempre que address mudar, persiste
    effect(() => {
      const addr = this.address();

      if (addr) {
        localStorage.setItem(this.ADDRESS_STORAGE_KEY, JSON.stringify(addr));
      } else {
        localStorage.removeItem(this.ADDRESS_STORAGE_KEY);
      }
    });
  }

  clearAddress() {
    this.address.set(null);
    localStorage.removeItem(this.ADDRESS_STORAGE_KEY);
  }

  step = signal<1 | 2 | 3>(1);

  address = signal<Address | null>(null);
  paymentMethod = signal<'pix' | 'card' | 'cash' | null>(null);
  couponCode = signal<string>('');

  // ✅ sucesso "uma vez só"
  private readonly _successAllowed = signal(false);
  private readonly _lastOrderId = signal<number | null>(null);

  // read-only helpers
  successAllowed() {
    return this._successAllowed();
  }

  lastOrderId() {
    return this._lastOrderId();
  }

  allowSuccessOnce(orderId: number) {
    this._lastOrderId.set(orderId);
    this._successAllowed.set(true);
  }

  consumeSuccessOrderId(): number | null {
    if (!this._successAllowed() || !this._lastOrderId()) return null;

    const id = this._lastOrderId();
    this._successAllowed.set(false);
    this._lastOrderId.set(null);
    return id;
  }

  canShowSuccess(): boolean {
    return this._successAllowed() && !!this._lastOrderId();
  }

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

    // também limpa o "sucesso"
    this._successAllowed.set(false);
    this._lastOrderId.set(null);
  }

  // ✅ útil após criar o pedido: limpa checkout, mas deixa o success "vivo"
  resetAfterOrderCreated() {
    this.step.set(1);
    this.address.set(null);
    this.paymentMethod.set(null);
    this.couponCode.set('');
  }
}
