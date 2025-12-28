import { Component } from '@angular/core';
import { CheckoutService } from './checkout.service';
import { AddressFormComponent } from './address-form.component';
import { PaymentStepComponent } from './payment-step.component';
import { ReviewStepComponent } from './review-step.component';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [AddressFormComponent, PaymentStepComponent, ReviewStepComponent],
  template: `
    <section class="page">
      <div class="w-full max-w-3xl space-y-6">
        <header>
          <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">Checkout</h1>
          <p class="text-sm text-gray-500 mt-1">Endereço → pagamento → revisão.</p>
        </header>

        <!-- Stepper -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="h-8 w-8 rounded-full grid place-items-center text-sm font-semibold"
              [class]="
                checkout.step() === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition'
              "
              (click)="checkout.goTo(1)"
              aria-label="Ir para Endereço"
            >
              1
            </button>
            <span class="text-sm font-medium text-gray-800">Endereço</span>
          </div>

          <div class="flex-1 h-px bg-gray-200"></div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="h-8 w-8 rounded-full grid place-items-center text-sm font-semibold"
              [class]="
                checkout.step() === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition'
              "
              (click)="checkout.goTo(2)"
              aria-label="Ir para Pagamento"
            >
              2
            </button>
            <span class="text-sm font-medium text-gray-800">Pagamento</span>
          </div>

          <div class="flex-1 h-px bg-gray-200"></div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="h-8 w-8 rounded-full grid place-items-center text-sm font-semibold"
              [class]="
                checkout.step() === 3
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition'
              "
              (click)="checkout.goTo(3)"
              aria-label="Ir para Revisão"
            >
              3
            </button>
            <span class="text-sm font-medium text-gray-800">Revisão</span>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-6">
          @if (checkout.step() === 1) { <app-address-form /> } @if (checkout.step() === 2) {
          <app-payment-step /> } @if (checkout.step() === 3) { <app-review-step /> }
        </div>
      </div>
    </section>
  `,
})
export class CheckoutPage {
  constructor(public checkout: CheckoutService) {}
}
