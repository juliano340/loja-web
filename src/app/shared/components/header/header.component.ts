import { Component } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',

  standalone: true,
  imports: [RouterLink],

  template: `
    <header>
      <a routerLink="/products">Produtos</a>
      <a routerLink="/cart">🛒 {{ cart.totalItems() }}</a>
    </header>
  `,
  styles: [
    `
      header {
        padding: 12px;
        background: #222;
        color: #fff;
        display: flex;
        justify-content: flex-end;
      }
    `,
  ],
})
export class HeaderComponent {
  constructor(public cart: CartService) {}
}
