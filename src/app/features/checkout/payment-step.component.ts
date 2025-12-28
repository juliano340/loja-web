import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckoutService } from './checkout.service';
import { CartService } from '../../core/services/cart.service';

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

    <div class="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <div class="text-sm font-semibold text-gray-900">Cupom</div>
      <div class="mt-3 flex flex-col sm:flex-row gap-3">
        <input
          class="input sm:flex-1"
          type="text"
          [(ngModel)]="coupon"
          name="coupon"
          (ngModelChange)="onCouponChange()"
        />
        <button
          type="button"
          class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition sm:w-auto"
          (click)="applyCoupon()"
          [disabled]="!coupon.trim()"
        >
          Aplicar
        </button>
      </div>
      @if (couponApplied) {
      <div class="mt-3 text-sm text-green-700">
        Cupom aplicado: <span class="font-semibold">{{ couponApplied }}</span>
      </div>
      }
    </div>

    <div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Total</span>
        <span class="font-semibold text-gray-900">
          {{ money(cart.totalPrice()) }}
        </span>
      </div>
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
  coupon = '';
  couponApplied = '';

  constructor(public checkout: CheckoutService, public cart: CartService) {
    this.coupon = this.checkout.couponCode();
    this.couponApplied = this.checkout.couponCode().trim();
  }

  select(method: 'pix' | 'card' | 'cash') {
    this.checkout.paymentMethod.set(method);
  }

  isSelected(method: 'pix' | 'card' | 'cash') {
    return this.checkout.paymentMethod() === method;
  }

  onCouponChange() {
    this.checkout.couponCode.set(this.coupon);
  }

  applyCoupon() {
    const code = this.coupon.trim();
    this.couponApplied = code;
    this.checkout.couponCode.set(code);
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
