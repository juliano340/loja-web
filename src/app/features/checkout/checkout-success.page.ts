import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer, of } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { CheckoutService } from './checkout.service';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';

type PageState = 'confirming' | 'confirmed' | 'timeout' | 'missing';

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
              class="h-12 w-12 rounded-full border flex items-center justify-center shrink-0"
              [class.bg-green-50]="state === 'confirmed'"
              [class.border-green-200]="state === 'confirmed'"
              [class.bg-blue-50]="state === 'confirming'"
              [class.border-blue-200]="state === 'confirming'"
              [class.bg-amber-50]="state === 'timeout'"
              [class.border-amber-200]="state === 'timeout'"
              aria-hidden="true"
            >
              @if (state === 'confirmed') {
              <span class="text-green-700 text-xl">✓</span>
              } @else if (state === 'confirming') {
              <span class="text-blue-700 text-sm font-semibold">…</span>
              } @else {
              <span class="text-amber-700 text-xl">!</span>
              }
            </div>

            <div class="min-w-0">
              @if (state === 'confirmed') {
              <h1 class="text-2xl font-semibold text-gray-900">Pedido confirmado</h1>
              } @else if (state === 'confirming') {
              <h1 class="text-2xl font-semibold text-gray-900">Confirmando pagamento…</h1>
              } @else if (state === 'timeout') {
              <h1 class="text-2xl font-semibold text-gray-900">Ainda confirmando…</h1>
              } @else {
              <h1 class="text-2xl font-semibold text-gray-900">Pedido não encontrado</h1>
              } @if (orderId) {
              <p class="text-sm text-gray-600 mt-2">
                Número do pedido:
                <span class="font-semibold text-gray-900">#{{ orderId }}</span>
              </p>
              } @if (state === 'confirming') {
              <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                Só um instante — estamos confirmando o pagamento.
              </p>
              } @else if (state === 'confirmed') {
              <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                Você já pode acompanhar o status em <span class="font-medium">Meus pedidos</span>.
              </p>
              } @else if (state === 'timeout') {
              <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                Às vezes o retorno do pagamento leva alguns segundos a mais. Você pode acompanhar em
                <span class="font-medium">Meus pedidos</span> ou atualizar esta página.
              </p>
              } @else {
              <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                Não encontrei um pedido recente para confirmar.
              </p>
              }
            </div>
          </div>

          @if (state === 'confirmed' || state === 'timeout') {
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a routerLink="/orders" class="btn-primary text-center"> Ver meus pedidos </a>

            <a
              routerLink="/products"
              class="w-full text-center px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
            >
              Continuar comprando
            </a>
          </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class CheckoutSuccessPage implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly orders = inject(OrdersService);
  private readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);

  state: PageState = 'confirming';
  orderId: number | null = null;

  private cleaned = false;

  // polling leve
  private readonly intervalMs = 1200;
  private readonly timeoutMs = 45_000;

  ngOnInit(): void {
    const raw = localStorage.getItem('lastOrderId');

    if (!raw) {
      this.state = 'missing';
      this.router.navigate(['/orders']);
      return;
    }

    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      this.state = 'missing';
      this.router.navigate(['/orders']);
      return;
    }

    this.orderId = id;
    this.state = 'confirming';

    timer(0, this.intervalMs)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(timer(this.timeoutMs)),
        switchMap(() =>
          this.orders.getById(id).pipe(
            // se falhar momentaneamente, continua tentando até o timeout
            catchError(() => of(null))
          )
        ),
        tap((order: any) => {
          if (order?.status === 'PAID') {
            this.state = 'confirmed';
            this.finalizeSuccessPaid();
          }
        }),
        filter((order: any) => order?.status === 'PAID'),
        take(1)
      )
      .subscribe({
        complete: () => {
          if (this.state !== 'confirmed') this.state = 'timeout';
        },
      });
  }

  private finalizeSuccessPaid() {
    if (this.cleaned) return;
    this.cleaned = true;

    this.cart.clear();
    this.checkout.clearAddress();
    localStorage.removeItem('lastOrderId');
  }
}
