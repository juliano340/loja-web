import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header>
      <a routerLink="/products">Produtos</a>
      <a routerLink="/cart">🛒 {{ cart.totalItems() }}</a>

      @if (auth.isAuthenticated()) {
      <span class="user"> Olá, {{ auth.user()?.name }} </span>

      <a routerLink="/orders">Meus pedidos</a>

      <button (click)="logout()">Sair</button>
      } @else {
      <a routerLink="/login">Login</a>
      <a routerLink="/register">Cadastrar</a>
      }
    </header>
  `,
  styles: [
    `
      header {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: #222;
        color: #fff;
        align-items: center;
      }

      .user {
        margin-left: auto;
        font-weight: bold;
      }

      a,
      button {
        color: #fff;
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: none;
      }
      .user {
        margin-left: auto;
      }
    `,
  ],
})
export class HeaderComponent {
  constructor(public cart: CartService, public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
