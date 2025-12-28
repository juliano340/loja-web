import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  template: `
    <h1>Carrinho</h1>

    @if (cart.items().length === 0) {
    <p>Seu carrinho está vazio.</p>
    } @else {

    <ul>
      @for (item of cart.items(); track item.product.id) {
      <li>
        {{ item.product.name }}
        — {{ item.quantity }}x — R$ {{ item.product.price }}

        <button (click)="remove(item.product.id)">Remover</button>
      </li>
      }
    </ul>

    <hr />

    <p>
      <strong>Total:</strong>
      R$ {{ cart.totalPrice().toFixed(2) }}
    </p>

    <button class="btn-primary" (click)="goToCheckout()">Finalizar compra</button>
    }
  `,
})
export class CartPage {
  constructor(public cart: CartService, private router: Router) {}

  remove(productId: number) {
    this.cart.remove(productId);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
