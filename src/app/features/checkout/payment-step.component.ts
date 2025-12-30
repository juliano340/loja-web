import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckoutService } from './checkout.service';
import { CartService } from '../../core/services/cart.service';

type CouponPreviewResponse = {
  coupon: { code: string; type: string; value: string };
  discountAmount: string; // "12.34"
};

@Component({
  standalone: true,
  selector: 'app-payment-step',
  imports: [FormsModule],
  template: `
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Pagamento</h2>
        <p class="text-sm text-gray-500 mt-1">Escolha a forma de pagamento.</p>
      </div>

      <button
        type="button"
        class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
        (click)="checkout.previousStep()"
      >
        Voltar
      </button>
    </div>

    @if (!checkout.address()) {
    <div
      class="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Endereço não informado. Volte e preencha para continuar.
    </div>
    } @else if (cart.items().length === 0) {
    <div
      class="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Seu carrinho está vazio.
    </div>
    } @else {

    <div class="mt-6">
      <div class="text-sm font-semibold text-gray-900 mb-3">Forma de pagamento</div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          class="px-4 py-3 rounded-md border transition text-left"
          [class]="
            isSelected('pix') ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
          "
          (click)="select('pix')"
        >
          <div class="font-semibold text-gray-900">PIX</div>
          <div class="text-xs text-gray-500 mt-1">Aprovação rápida</div>
        </button>

        <button
          type="button"
          class="px-4 py-3 rounded-md border transition text-left"
          [class]="
            isSelected('card') ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
          "
          (click)="select('card')"
        >
          <div class="font-semibold text-gray-900">Cartão</div>
          <div class="text-xs text-gray-500 mt-1">Crédito / Débito</div>
        </button>

        <button
          type="button"
          class="px-4 py-3 rounded-md border transition text-left"
          [class]="
            isSelected('cash') ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
          "
          (click)="select('cash')"
        >
          <div class="font-semibold text-gray-900">Na entrega</div>
          <div class="text-xs text-gray-500 mt-1">Pague ao receber</div>
        </button>
      </div>
    </div>

    <!-- Cupom -->
    <div class="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-gray-900">Cupom</div>
          <p class="text-xs text-gray-500 mt-1">Digite o código e clique em “Aplicar”.</p>
        </div>

        @if (appliedCoupon) {
        <span
          class="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-800"
        >
          Aplicado
        </span>
        }
      </div>

      @if (!appliedCoupon) {
      <div class="mt-3 flex flex-col sm:flex-row gap-3">
        <input
          class="input sm:flex-1"
          type="text"
          [(ngModel)]="couponDraft"
          name="coupon"
          (ngModelChange)="onDraftChange()"
          placeholder="Ex: OFF10"
          autocomplete="off"
        />

        <button
          type="button"
          class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition sm:w-auto
                     disabled:opacity-60 disabled:cursor-not-allowed"
          (click)="applyCoupon()"
          [disabled]="!couponDraft.trim() || couponLoading"
        >
          @if (couponLoading) { Aplicando... } @else { Aplicar }
        </button>
      </div>

      @if (couponError) {
      <div class="mt-3 text-sm text-red-700">{{ couponError }}</div>
      } } @else {
      <div
        class="mt-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            Cupom aplicado:
            <span class="font-semibold">{{ appliedCoupon }}</span>
            @if (discount() > 0) {
            <div class="text-xs text-green-900/80 mt-1">
              Desconto: <span class="font-semibold">{{ money(discount()) }}</span>
            </div>
            }
          </div>

          <button
            type="button"
            class="shrink-0 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-900 text-sm font-medium
                       hover:bg-gray-50 transition"
            (click)="removeCoupon()"
            aria-label="Remover cupom"
          >
            Remover
          </button>
        </div>
      </div>
      }
    </div>

    <!-- Totais -->
    <div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Subtotal</span>
          <span class="font-medium text-gray-900">{{ money(subtotal()) }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-600">Frete</span>
          <span class="font-medium text-gray-900">{{ money(shippingFeeEstimate()) }}</span>
        </div>

        @if (discount() > 0) {
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Desconto</span>
          <span class="font-medium text-green-700">- {{ money(discount()) }}</span>
        </div>
        }

        <div class="h-px bg-gray-200 my-2"></div>

        <div class="flex items-center justify-between">
          <span class="text-gray-900 font-semibold">Total</span>
          <span class="text-gray-900 font-bold">{{ money(total()) }}</span>
        </div>
      </div>

      <p class="text-xs text-gray-500 mt-3">
        O valor do frete segue a mesma regra do backend (RS: R$ 15, outros: R$ 25, acima de R$ 200:
        grátis).
      </p>
    </div>

    <button
      class="btn-primary mt-6"
      type="button"
      [disabled]="!canContinue()"
      (click)="checkout.nextStep()"
    >
      Continuar para revisão
    </button>

    @if (!checkout.paymentMethod()) {
    <div class="mt-3 text-xs text-gray-500">
      <span class="text-blue-600">*</span> Selecione um método de pagamento para continuar.
    </div>
    } }
  `,
})
export class PaymentStepComponent {
  private http = inject(HttpClient);

  couponDraft = '';
  couponError = '';
  couponLoading = false;

  // desconto vindo do backend (prévia)
  private discountAmountNumber = 0;

  constructor(public checkout: CheckoutService, public cart: CartService) {
    const applied = this.checkout.couponCode().trim();
    this.couponDraft = applied;

    // se já tinha cupom salvo, tenta buscar a prévia para mostrar o total correto
    if (applied) {
      this.previewCoupon(applied);
    }
  }

  // ---- pagamento ----
  select(method: 'pix' | 'card' | 'cash') {
    this.checkout.paymentMethod.set(method);
  }

  isSelected(method: 'pix' | 'card' | 'cash') {
    return this.checkout.paymentMethod() === method;
  }

  // ---- cupom ----
  get appliedCoupon(): string {
    const c = this.checkout.couponCode().trim();
    return c ? c : '';
  }

  onDraftChange() {
    this.couponError = '';
  }

  applyCoupon() {
    const code = this.normalizeCoupon(this.couponDraft);
    if (!code) return;

    if (code.length < 3 || code.length > 32) {
      this.couponError = 'Código de cupom inválido.';
      return;
    }

    this.previewCoupon(code);
  }

  removeCoupon() {
    this.checkout.couponCode.set('');
    this.couponDraft = '';
    this.couponError = '';
    this.discountAmountNumber = 0;
  }

  private previewCoupon(code: string) {
    this.couponLoading = true;
    this.couponError = '';

    const subtotal = this.subtotal();
    const body = {
      couponCode: code,
      subtotal: subtotal.toFixed(2), // backend espera string
    };

    this.http.post<CouponPreviewResponse>('/api/coupons/preview', body).subscribe({
      next: (res) => {
        const discount = Number(String(res?.discountAmount ?? '0').replace(',', '.'));
        this.discountAmountNumber = Number.isFinite(discount) ? discount : 0;

        // aplica no estado do checkout só se validou no backend
        this.checkout.couponCode.set(res?.coupon?.code ?? code);
        this.couponDraft = res?.coupon?.code ?? code;

        this.couponLoading = false;
      },
      error: (err: any) => {
        this.couponLoading = false;
        this.discountAmountNumber = 0;
        this.checkout.couponCode.set('');

        const msg = err?.error?.message;
        this.couponError = Array.isArray(msg) ? msg.join(', ') : msg || 'Cupom inválido.';
      },
    });
  }

  private normalizeCoupon(raw: string): string {
    return String(raw ?? '')
      .trim()
      .replace(/\s+/g, '')
      .toUpperCase();
  }

  // ---- totais (espelhando regra do backend) ----
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
    const s = this.subtotal();
    const d = Number.isFinite(this.discountAmountNumber) ? this.discountAmountNumber : 0;
    return Math.min(s, Math.max(0, d));
  }

  total(): number {
    const t = this.subtotal() - this.discount() + this.shippingFeeEstimate();
    return Math.max(0, t);
  }

  canContinue() {
    return (
      this.cart.items().length > 0 && !!this.checkout.address() && !!this.checkout.paymentMethod()
    );
  }

  money(value: number): string {
    const safe = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe);
  }
}
