import { Component, HostListener } from '@angular/core';
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
        <a routerLink="/" class="header-title" (click)="closeAll()"> Loja Web </a>

        <!-- DIREITA -->
        <div class="header-right">
          <!-- MENU DESKTOP -->
          <nav class="header-nav">
            <a routerLink="/products" class="header-link" (click)="closeAll()">Produtos</a>

            <!-- ✅ Se logado: deixa "Meus pedidos" (opcional) e perfil no dropdown -->
            @if (auth.isAuthenticated()) {
            <a routerLink="/orders" class="header-link" (click)="closeAll()">Meus pedidos</a>

            <!-- PERFIL (dropdown) -->
            <div class="relative">
              <button
                type="button"
                class="icon-btn"
                (click)="toggleProfileMenu($event)"
                aria-label="Menu do perfil"
                [attr.aria-expanded]="profileOpen"
              >
                👤
              </button>

              @if (profileOpen) {
              <div
                class="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
                role="menu"
                aria-label="Opções do perfil"
              >
                <a
                  routerLink="/profile"
                  class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Meu perfil
                </a>

                <a
                  routerLink="/orders"
                  class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Meus pedidos
                </a>

                <div class="border-t border-gray-200"></div>

                <button
                  type="button"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  role="menuitem"
                  (click)="logout()"
                >
                  Sair
                </button>
              </div>
              }
            </div>
            } @else {
            <!-- ✅ Se guest: perfil vira menu de autenticação -->
            <div class="relative">
              <button
                type="button"
                class="icon-btn"
                (click)="toggleProfileMenu($event)"
                aria-label="Entrar ou cadastrar"
                [attr.aria-expanded]="profileOpen"
              >
                👤
              </button>

              @if (profileOpen) {
              <div
                class="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
                role="menu"
                aria-label="Conta"
              >
                <a
                  routerLink="/login"
                  class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Entrar
                </a>

                <a
                  routerLink="/register"
                  class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Cadastrar
                </a>
              </div>
              }
            </div>
            }
          </nav>

          <!-- CARRINHO -->
          <a
            routerLink="/cart"
            class="icon-btn relative"
            aria-label="Carrinho"
            (click)="closeAll()"
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
          <a routerLink="/products" class="mobile-menu-item" (click)="closeAll()"> Produtos </a>

          @if (auth.isAuthenticated()) {
          <a routerLink="/orders" class="mobile-menu-item" (click)="closeAll()"> Meus pedidos </a>
          <a routerLink="/profile" class="mobile-menu-item" (click)="closeAll()"> Meu perfil </a>
          <button type="button" class="mobile-menu-item text-left" (click)="logout()">Sair</button>
          } @else {
          <a routerLink="/login" class="mobile-menu-item" (click)="closeAll()"> Login </a>
          <a routerLink="/register" class="mobile-menu-item" (click)="closeAll()"> Cadastrar </a>
          }
        </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  menuOpen = false;
  profileOpen = false;

  constructor(public cart: CartService, public auth: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;

    // se abriu menu mobile, fecha dropdown do perfil
    if (this.menuOpen) this.profileOpen = false;
  }

  closeAll() {
    this.menuOpen = false;
    this.profileOpen = false;
  }

  toggleProfileMenu(ev: MouseEvent) {
    ev.stopPropagation();
    this.profileOpen = !this.profileOpen;

    // se abriu dropdown do perfil, fecha menu mobile
    if (this.profileOpen) this.menuOpen = false;
  }

  logout() {
    this.closeAll();
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // ✅ fecha ao clicar fora
  @HostListener('document:click')
  onDocClick() {
    if (this.profileOpen) this.profileOpen = false;
  }

  // ✅ fecha com ESC
  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeAll();
  }
}
