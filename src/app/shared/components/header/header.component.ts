import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="header">
      <div class="header-container">
        <!-- ESQUERDA -->
        <a routerLink="/" class="header-title" (click)="closeMenu()"> Loja Web </a>

        <!-- DIREITA -->
        <div class="header-right">
          <!-- MENU DESKTOP -->
          <nav class="header-nav">
            <a routerLink="/products" class="header-link">Produtos</a>

            @if (auth.isAuthenticated()) {
            <a routerLink="/orders" class="header-link">Meus pedidos</a>
            } @else {
            <a routerLink="/login" class="header-link">Login</a>
            <a routerLink="/register" class="header-link">Cadastrar</a>
            }
          </nav>

          <!-- CARRINHO -->
          <a
            routerLink="/cart"
            class="icon-btn relative"
            aria-label="Carrinho"
            (click)="closeMenu()"
          >
            🛒 @if (cart.totalItems() > 0) {
            <span class="cart-badge">
              {{ cart.totalItems() }}
            </span>
            }
          </a>

          <!-- BOTÃO MOBILE -->
          <button class="icon-btn md:hidden" (click)="toggleMenu()" aria-label="Menu">☰</button>
        </div>

        <!-- MENU MOBILE -->
        @if (menuOpen) {
        <div class="mobile-menu md:hidden">
          <a routerLink="/products" class="mobile-menu-item" (click)="closeMenu()"> Produtos </a>

          @if (auth.isAuthenticated()) {

          <a routerLink="/orders" class="mobile-menu-item" (click)="closeMenu()"> Meus pedidos </a>

          <button class="mobile-menu-item text-left" (click)="logout()">Sair</button>

          } @else {

          <a routerLink="/login" class="mobile-menu-item" (click)="closeMenu()"> Login </a>

          <a routerLink="/register" class="mobile-menu-item" (click)="closeMenu()"> Cadastrar </a>

          }
        </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  menuOpen = false;

  constructor(public cart: CartService, public auth: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout() {
    this.closeMenu();
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
