import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService } from './checkout.service';

@Component({
  standalone: true,
  selector: 'app-checkout-success-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="w-full max-w-2xl">
        <div class="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <div class="flex items-start gap-4">
            <div
              class="h-12 w-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span class="text-green-700 text-xl">✓</span>
            </div>

            <div class="min-w-0">
              <h1 class="text-2xl font-semibold text-gray-900">Pedido confirmado</h1>

              @if (orderId) {
              <p class="text-sm text-gray-600 mt-2">
                Número do pedido:
                <span class="font-semibold text-gray-900">#{{ orderId }}</span>
              </p>
              }

              <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                Você já pode acompanhar o status em <span class="font-medium">Meus pedidos</span>.
              </p>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a routerLink="/orders" class="btn-primary text-center"> Ver meus pedidos </a>

            <a
              routerLink="/products"
              class="w-full text-center px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
            >
              Continuar comprando
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CheckoutSuccessPage implements OnInit {
  orderId: number | null = null;

  constructor(private checkout: CheckoutService, private router: Router) {}

  ngOnInit(): void {
    // ✅ consome: depois disso, nunca mais entra nessa página
    this.orderId = this.checkout.consumeSuccessOrderId();

    // segurança extra: se alguém cair aqui sem token, redireciona
    if (!this.orderId) {
      this.router.navigate(['/orders']);
    }
  }
}
