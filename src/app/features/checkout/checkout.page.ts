import { Component } from '@angular/core';
import { CheckoutService } from './checkout.service';
import { AddressFormComponent } from './address-form.component';
import { PaymentStepComponent } from './payment-step.component';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [AddressFormComponent, PaymentStepComponent],
  template: `
    <div class="page">
      <div class="card">
        <h1 class="text-xl font-semibold mb-4">Checkout</h1>

        @if (checkout.step() === 1) {
        <app-address-form />
        } @if (checkout.step() === 2) {
        <app-payment-step />
        }
      </div>
    </div>
  `,
})
export class CheckoutPage {
  constructor(public checkout: CheckoutService) {}
}
