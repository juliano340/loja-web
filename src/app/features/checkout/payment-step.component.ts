import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutService } from './checkout.service';
import { CartService } from '../../core/services/cart.service';
import { OrdersService, CreateOrderInput } from '../../core/services/orders.service';

@Component({
  standalone: true,
  selector: 'app-payment-step',
  template: `
    <h2 class="text-lg font-semibold text-gray-900 mb-2">Pagamento</h2>
    <p class="text-sm text-gray-500 mb-4">Escolha a forma de pagamento.</p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <button class="btn-secondary" type="button" (click)="select('pix')">PIX</button>
      <button class="btn-secondary" type="button" (click)="select('card')">Cartão</button>
      <button class="btn-secondary" type="button" (click)="select('cash')">Na entrega</button>
    </div>

    <button
      class="btn-primary"
      type="button"
      [disabled]="loading || !canFinish()"
      (click)="finish()"
    >
      @if (loading) { Finalizando... } @else { Finalizar pedido }
    </button>

    @if (error) {
    <div class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </div>
    }
  `,
})
export class PaymentStepComponent {
  loading = false;
  error = '';

  constructor(
    private checkout: CheckoutService,
    private cart: CartService,
    private ordersService: OrdersService,
    private router: Router
  ) {}

  select(method: 'pix' | 'card' | 'cash') {
    this.checkout.paymentMethod.set(method);
    this.error = '';
  }

  canFinish() {
    return (
      this.cart.items().length > 0 && !!this.checkout.address() && !!this.checkout.paymentMethod()
    );
  }

  finish() {
    if (this.loading) return;

    const address = this.checkout.address();
    if (!address) {
      this.checkout.previousStep();
      return;
    }

    // validação alinhada ao DTO (zip 5..10 e state 2)
    const zip = String(address.zip ?? '').trim();
    const state = String(address.state ?? '')
      .trim()
      .toUpperCase();

    if (zip.length < 5 || zip.length > 10) {
      this.error = 'CEP inválido (deve ter entre 5 e 10 caracteres).';
      this.checkout.previousStep();
      return;
    }
    if (state.length !== 2) {
      this.error = 'UF inválida (deve ter 2 letras).';
      this.checkout.previousStep();
      return;
    }

    const items = this.cart.items().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const shippingAddress: any = {
      zip,
      street: String(address.street ?? '').trim(),
      number: String(address.number ?? '').trim(),
      city: String(address.city ?? '').trim(),
      state,
    };

    // ✅ agora pode enviar complement
    const complement = (address.complement ?? '').trim();
    if (complement) shippingAddress.complement = complement;

    const payload: CreateOrderInput = {
      items,
      shippingAddress,
      couponCode: null,
    };

    this.loading = true;
    this.error = '';

    this.ordersService.create(payload).subscribe({
      next: () => {
        this.cart.clear();
        this.checkout.reset();
        this.router.navigate(['/checkout/success']);
      },
      error: (err: any) => {
        console.error('Erro ao criar pedido:', err);
        this.loading = false;
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao finalizar pedido.';
      },
    });
  }
}
