import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutService } from './checkout.service';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  standalone: true,
  selector: 'app-payment-step',
  template: `
    <h2 class="text-lg font-medium mb-4">Pagamento</h2>

    <!-- UI de pagamento (opcional pro backend, mas bom pro fluxo) -->
    <div class="space-y-2 mb-6">
      <button class="btn-primary" type="button" (click)="select('pix')">PIX</button>
      <button class="btn-primary" type="button" (click)="select('card')">Cartão</button>
      <button class="btn-primary" type="button" (click)="select('cash')">Na entrega</button>
    </div>

    <button
      class="btn-primary mt-4"
      type="button"
      [disabled]="loading || !canFinish()"
      (click)="finish()"
    >
      @if (loading) { Finalizando... } @else { Finalizar pedido }
    </button>
  `,
})
export class PaymentStepComponent {
  loading = false;

  // você pode manter isso só pra UX
  selectedPayment: 'pix' | 'card' | 'cash' | null = null;

  constructor(
    private checkout: CheckoutService,
    private cart: CartService,
    private ordersService: OrdersService,
    private router: Router
  ) {}

  select(method: 'pix' | 'card' | 'cash') {
    this.selectedPayment = method;
  }

  canFinish() {
    return (
      this.cart.items().length > 0 && !!this.checkout.address() && !!this.selectedPayment // UX
    );
  }

  finish() {
    if (this.loading) return;

    const address = this.checkout.address();
    if (!address) {
      this.checkout.previousStep();
      return;
    }

    // ✅ backend quer "zip" string (min 5)
    const zip = String((address as any).zip ?? (address as any).cep ?? '').trim();
    if (zip.length < 5) {
      alert('CEP inválido. Informe um CEP com pelo menos 5 caracteres.');
      this.checkout.previousStep();
      return;
    }

    const items = this.cart.items().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    // ✅ payload conforme CreateOrderDto do backend
    const payload = {
      items,
      shippingAddress: {
        zip,
        street: String((address as any).street ?? '').trim(),
        number: String((address as any).number ?? '').trim(),
        complement: (address as any).complement
          ? String((address as any).complement).trim()
          : undefined,
        city: String((address as any).city ?? '').trim(),
        state: String((address as any).state ?? '').trim(),
      },
      // couponCode: undefined, // se você implementar cupom depois
    };

    this.loading = true;

    this.ordersService.create(payload).subscribe({
      next: () => {
        this.cart.clear();
        this.router.navigate(['/checkout/success']);
      },
      error: (err: unknown) => {
        console.error('Erro ao criar pedido:', err);
        this.loading = false;
        alert('Erro ao finalizar pedido');
      },
    });
  }
}
