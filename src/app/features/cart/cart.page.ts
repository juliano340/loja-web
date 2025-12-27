import { Component } from '@angular/core';
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
        {{ item.product.name }} — {{ item.quantity }}x
        <button (click)="remove(item.product.id)">Remover</button>
      </li>
      }
    </ul>

    <button (click)="cart.clear()">Limpar carrinho</button>
    }
  `,
})
export class CartPage {
  constructor(public cart: CartService) {}

  remove(productId: number) {
    this.cart.remove(productId);
  }
}
