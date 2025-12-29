import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutService } from './checkout.service';
import { CartService } from '../../core/services/cart.service';
import { OrdersService, CreateOrderInput, Order } from '../../core/services/orders.service';

type CouponPreviewResponse = {
  coupon: { code: string; type: string; value: string };
  discountAmount: string;
};

type CheckoutSessionResponse = { url: string; sessionId: string };

@Component({
  standalone: true,
  selector: 'app-review-step',
  template: `
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Revisão</h2>
        <p class="text-sm text-gray-500 mt-1">Confirme seus dados antes de finalizar.</p>
      </div>

      <button
        type="button"
        class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
        (click)="checkout.previousStep()"
        [disabled]="loading || couponLoading"
      >
        Voltar
      </button>
    </div>

    @if (!address || !paymentMethod || cart.items().length === 0) {
    <div
      class="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Checkout incompleto. Verifique endereço, pagamento e carrinho.
    </div>
    } @else {
    <div class="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-gray-900">Endereço</div>
          <div class="text-sm text-gray-600 mt-1 leading-relaxed">
            {{ address.street }}, {{ address.number }} @if (address.complement) {
            <span> — {{ address.complement }}</span> }
            <br />
            {{ address.city }} / {{ address.state }} — {{ address.zip }}
          </div>
        </div>

        <button
          type="button"
          class="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          (click)="checkout.goTo(1)"
          [disabled]="loading || couponLoading"
        >
          Editar
        </button>
      </div>
    </div>

    <div class="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-gray-900">Pagamento</div>
          <div class="text-sm text-gray-600 mt-1">
            {{ paymentLabel(paymentMethod) }}
          </div>

          @if (coupon) {
          <div class="text-sm text-gray-600 mt-1">
            Cupom:
            <span class="font-medium text-gray-900">{{ coupon }}</span>

            @if (couponLoading) {
            <span class="text-xs text-gray-500"> • validando...</span>
            } @else if (couponPreviewError) {
            <span class="text-xs text-red-700"> • {{ couponPreviewError }}</span>
            } @else if (discount() > 0) {
            <span class="text-xs text-gray-500"> • desconto {{ money(discount()) }}</span>
            } @else {
            <span class="text-xs text-gray-500"> • sem desconto</span>
            }
          </div>
          }
        </div>

        <button
          type="button"
          class="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          (click)="checkout.goTo(2)"
          [disabled]="loading || couponLoading"
        >
          Editar
        </button>
      </div>
    </div>

    <div class="mt-4 rounded-lg border border-gray-200 bg-white">
      <div class="p-4 border-b border-gray-200">
        <div class="text-sm font-semibold text-gray-900">Itens</div>
      </div>

      <div class="p-4 space-y-3">
        @for (item of cart.items(); track item.product.id) {
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate">
              {{ item.product.name }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ item.quantity }}x • {{ money(unitPrice(item)) }}
            </div>
          </div>
          <div class="text-sm font-semibold text-gray-900">
            {{ money(lineTotal(item)) }}
          </div>
        </div>
        }

        <div class="h-px bg-gray-200 my-2"></div>

        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Subtotal</span>
            <span class="font-medium text-gray-900">{{ money(subtotal()) }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-600">Frete</span>
            <span class="font-medium text-gray-900">{{ money(shippingFeeEstimate()) }}</span>
          </div>

          @if (coupon && !couponLoading && !couponPreviewError && discount() > 0) {
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Desconto</span>
            <span class="font-medium text-green-700">- {{ money(discount()) }}</span>
          </div>
          }

          <div class="flex items-center justify-between pt-2 border-t border-gray-200">
            <span class="text-gray-900 font-semibold">Total</span>
            <span class="text-gray-900 font-bold">
              @if (coupon && couponLoading) { — } @else { {{ money(total()) }} }
            </span>
          </div>

          @if (coupon && !couponLoading && couponPreviewError) {
          <div class="text-xs text-gray-500 pt-1">
            O pedido ainda pode ser finalizado, mas o cupom será ignorado se continuar inválido.
          </div>
          }
        </div>
      </div>
    </div>

    <button
      class="btn-primary mt-6"
      type="button"
      [disabled]="loading || couponLoading"
      (click)="finish()"
    >
      @if (loading) { Finalizando... } @else { @if (paymentMethod === 'card') { Pagar no cartão }
      @else { Confirmar pedido } }
    </button>

    @if (error) {
    <div class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </div>
    } }
  `,
})
export class ReviewStepComponent {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';

  loading = false;
  error = '';

  couponLoading = false;
  couponPreviewError = '';
  private discountAmountNumber = 0;

  constructor(
    public checkout: CheckoutService,
    public cart: CartService,
    private ordersService: OrdersService,
    private router: Router
  ) {
    const c = this.coupon;
    if (c) this.previewCoupon(c);
  }

  get address() {
    return this.checkout.address();
  }

  get paymentMethod() {
    return this.checkout.paymentMethod();
  }

  get coupon() {
    const c = this.checkout.couponCode().trim();
    return c || '';
  }

  paymentLabel(m: 'pix' | 'card' | 'cash') {
    if (m === 'pix') return 'PIX';
    if (m === 'card') return 'Cartão';
    return 'Na entrega';
  }

  previewCoupon(code: string) {
    const normalized = this.normalizeCoupon(code);
    if (!normalized) return;

    this.couponLoading = true;
    this.couponPreviewError = '';
    this.discountAmountNumber = 0;

    const body = { couponCode: normalized, subtotal: this.subtotal().toFixed(2) };

    this.http.post<CouponPreviewResponse>(`${this.baseUrl}/coupons/preview`, body).subscribe({
      next: (res) => {
        const serverCode = this.normalizeCoupon(res?.coupon?.code ?? normalized);
        if (serverCode && serverCode !== this.checkout.couponCode()) {
          this.checkout.couponCode.set(serverCode);
        }

        const discount = Number(String(res?.discountAmount ?? '0').replace(',', '.'));
        this.discountAmountNumber = Number.isFinite(discount) ? discount : 0;

        this.couponLoading = false;
      },
      error: (err: any) => {
        const msg = err?.error?.message;
        const text = Array.isArray(msg) ? msg.join(', ') : msg || 'Cupom inválido.';
        this.couponPreviewError = text;

        this.discountAmountNumber = 0;
        this.couponLoading = false;
      },
    });
  }

  private normalizeCoupon(raw: string): string {
    return String(raw ?? '')
      .trim()
      .replace(/\s+/g, '')
      .toUpperCase();
  }

  unitPrice(item: any): number {
    const n = Number(item?.product?.price);
    return Number.isFinite(n) ? n : 0;
  }

  lineTotal(item: any): number {
    return this.unitPrice(item) * (item?.quantity ?? 0);
  }

  subtotal(): number {
    const n = this.cart.totalPrice();
    return Number.isFinite(n) ? n : 0;
  }

  shippingFeeEstimate(): number {
    const subtotal = this.subtotal();
    if (subtotal >= 200) return 0;

    const state = String(this.checkout.address()?.state ?? '')
      .trim()
      .toUpperCase();
    if (!state) return 0;

    return state === 'RS' ? 15 : 25;
  }

  discount(): number {
    if (!this.coupon || this.couponPreviewError) return 0;

    const s = this.subtotal();
    const d = Number.isFinite(this.discountAmountNumber) ? this.discountAmountNumber : 0;
    return Math.min(s, Math.max(0, d));
  }

  total(): number {
    const t = this.subtotal() - this.discount() + this.shippingFeeEstimate();
    return Math.max(0, t);
  }

  money(value: number): string {
    const safe = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe);
  }

  private createCheckoutSession(orderId: number) {
    // ✅ usa o backend para criar a sessão Stripe
    return this.http.post<CheckoutSessionResponse>(`${this.baseUrl}/payments/checkout-session`, {
      orderId,
    });
  }

  finish() {
    if (this.loading) return;

    const address = this.address;
    const payment = this.paymentMethod;

    if (!address || !payment || this.cart.items().length === 0) {
      this.error = 'Checkout incompleto.';
      return;
    }

    const zip = String(address.zip ?? '').trim();
    const street = String(address.street ?? '').trim();
    const number = String(address.number ?? '').trim();
    const city = String(address.city ?? '').trim();
    const state = String(address.state ?? '')
      .trim()
      .toUpperCase();
    const complement = String(address.complement ?? '').trim();

    if (street.length < 3 || street.length > 100) return void (this.error = 'Rua inválida.');
    if (number.length < 1 || number.length > 20) return void (this.error = 'Número inválido.');
    if (city.length < 2 || city.length > 50) return void (this.error = 'Cidade inválida.');
    if (state.length !== 2) return void (this.error = 'UF inválida.');
    if (zip.length < 5 || zip.length > 10) return void (this.error = 'CEP inválido.');
    if (complement && (complement.length < 1 || complement.length > 100)) {
      return void (this.error = 'Complemento inválido.');
    }

    const items = this.cart.items().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const shippingAddress: any = { zip, street, number, city, state };
    if (complement) shippingAddress.complement = complement;

    // ✅ se preview acusou inválido, NÃO manda cupom
    const couponCode = this.coupon && !this.couponPreviewError ? this.coupon : '';

    const payload: CreateOrderInput = {
      items,
      shippingAddress,
      ...(couponCode ? { couponCode } : {}),
    };

    this.loading = true;
    this.error = '';

    this.ordersService.create(payload).subscribe({
      next: (order: Order) => {
        // ✅ guarda o orderId pra tela de success consultar
        localStorage.setItem('lastOrderId', String(order.id));

        // ✅ Se for cartão: cria sessão e redireciona para Stripe
        if (payment === 'card') {
          this.createCheckoutSession(order.id).subscribe({
            next: ({ url }) => {
              // não limpa carrinho ainda — pagamento será confirmado via webhook
              window.location.assign(url);
            },
            error: (err: any) => {
              this.loading = false;
              console.error('Erro ao criar checkout session:', err);
              const msg = err?.error?.message;
              this.error = Array.isArray(msg)
                ? msg.join(', ')
                : msg || 'Erro ao iniciar pagamento.';
            },
          });
          return;
        }

        // ✅ PIX / Na entrega: finaliza no app (sem Stripe)
        this.checkout.allowSuccessOnce(order.id);
        this.cart.clear();
        this.checkout.resetAfterOrderCreated();
        this.router.navigate(['/checkout/success']);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Erro ao criar pedido:', err);
        const msg = err?.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao finalizar pedido.';
      },
    });
  }
}
