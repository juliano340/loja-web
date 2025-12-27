import { Component } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';

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
        {{ item.product.name }} — {{ item.quantity }}x — R$ {{ item.product.price }}
        <button (click)="remove(item.product.id)">Remover</button>
      </li>
      }
    </ul>

    <hr />

    <p><strong>Total:</strong> R$ {{ cart.totalPrice().toFixed(2) }}</p>

    <button (click)="checkout()">Finalizar pedido</button>
    }
  `,
})
export class CartPage {
  constructor(public cart: CartService, private ordersService: OrdersService) {}

  remove(productId: number) {
    this.cart.remove(productId);
  }

  checkout() {
    const items = this.cart.items().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    this.ordersService.create(items).subscribe({
      next: () => {
        alert('Pedido criado com sucesso!');
        this.cart.clear();
      },
      error: () => alert('Erro ao criar pedido'),
    });
  }
}
