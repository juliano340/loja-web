import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutService } from './checkout.service';

@Component({
  standalone: true,
  selector: 'app-checkout-success',
  template: `
    <div class="page">
      <div class="card text-center">
        <h1 class="text-xl font-semibold mb-4">Pedido realizado com sucesso 🎉</h1>

        <p class="text-gray-700 mb-6">Obrigado pela sua compra.</p>

        <button class="btn-primary" (click)="goHome()">Voltar para a loja</button>
      </div>
    </div>
  `,
})
export class CheckoutSuccessPage {
  constructor(private router: Router, private checkout: CheckoutService) {}

  goHome() {
    this.checkout.reset();
    this.router.navigate(['/']);
  }
}
