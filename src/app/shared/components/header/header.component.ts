import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header>
      <a routerLink="/products">Produtos</a>
      <a routerLink="/cart">🛒 {{ cart.totalItems() }}</a>

      @if (auth.loadingUser()) {
      <span>Carregando...</span>
      } @else if (auth.isAuthenticated()) {
      <span class="user"> Olá, {{ auth.user()?.name }} </span>

      <a routerLink="/orders">Meus pedidos</a>
      <a routerLink="/profile">Perfil</a>

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
  constructor(public cart: CartService, public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
