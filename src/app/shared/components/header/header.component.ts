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
      <a routerLink="/cart">
        🛒 {{ cart.totalItems() }} itens — R$ {{ cart.totalPrice().toFixed(2) }}
      </a>
    </header>
  `,
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(public cart: CartService) {}
}
