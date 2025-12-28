import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
              <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                Recebemos seu pedido e ele já apareceu em
                <span class="font-medium">Meus pedidos</span>. Você pode acompanhar o status por lá.
              </p>
            </div>
          </div>

          <div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p class="text-sm text-gray-700">
              Dica: se você precisar alterar algum dado, consulte o pedido e entre em contato com o
              suporte.
            </p>
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

          <div class="mt-6 pt-6 border-t border-gray-200">
            <a
              routerLink="/"
              class="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              Voltar para a home
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CheckoutSuccessPage {}
