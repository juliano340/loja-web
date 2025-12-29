import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `<header class="header">
      <div class="header-container">
        <!-- ESQUERDA -->
        <a routerLink="/" class="header-title" (click)="closeAll()"> Loja Web </a>

        <!-- DIREITA -->
        <div class="header-right">
          <!-- MENU DESKTOP -->
          <nav class="header-nav">
            <a routerLink="/products" class="header-link" (click)="closeAll()">Produtos</a>

            <!-- PERFIL (dropdown) - desktop -->
            <div class="relative flex items-center gap-2">
              @if (auth.isAuthenticated()) {
              <span class="hidden md:inline text-sm text-gray-600 select-none">
                Olá, <span class="font-medium text-gray-900">{{ displayName }}!</span>
              </span>
              }

              <button
                type="button"
                class="icon-btn"
                [class.ring-1]="auth.isAuthenticated()"
                [class.ring-blue-100]="auth.isAuthenticated()"
                (click)="toggleProfileMenu($event)"
                aria-label="Menu do perfil"
                [attr.aria-expanded]="profileOpen"
              >
                <!-- user outline -->
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="8" r="4" />
                </svg>
              </button>

              @if (profileOpen) {
              <div
                class="absolute right-0 top-full mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50"
                role="menu"
                aria-label="Opções do perfil"
              >
                @if (auth.isAuthenticated()) {
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
                  (click)="openLogoutConfirm()"
                >
                  Sair
                </button>
                } @else {
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
                }
              </div>
              }
            </div>
          </nav>

          <!-- CARRINHO (SVG) -->
          <a
            routerLink="/cart"
            class="icon-btn relative"
            aria-label="Carrinho"
            (click)="closeAll()"
          >
            <!-- shopping cart outline -->
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="20" cy="21" r="1.5" />
              <path
                d="M1.5 2.5h2.2l2.1 12.1a2.2 2.2 0 0 0 2.2 1.8h9.7a2.2 2.2 0 0 0 2.2-1.7l1.2-7.3H6.1"
              />
            </svg>

            @if (cart.totalItems() > 0) {
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
          @if (auth.isAuthenticated()) {
          <div class="px-4 py-3 border-b border-gray-200 text-sm text-gray-700">
            Olá, <span class="font-medium text-gray-900">{{ displayName }}!</span>
          </div>
          }

          <a routerLink="/products" class="mobile-menu-item" (click)="closeAll()"> Produtos </a>

          @if (auth.isAuthenticated()) {
          <a routerLink="/orders" class="mobile-menu-item" (click)="closeAll()"> Meus pedidos </a>
          <a routerLink="/profile" class="mobile-menu-item" (click)="closeAll()"> Meu perfil </a>
          <button type="button" class="mobile-menu-item text-left" (click)="openLogoutConfirm()">
            Sair
          </button>
          } @else {
          <a routerLink="/login" class="mobile-menu-item" (click)="closeAll()"> Login </a>
          <a routerLink="/register" class="mobile-menu-item" (click)="closeAll()"> Cadastrar </a>
          }
        </div>
        }
      </div>
    </header>

    <!-- ✅ MODAL CONFIRMAÇÃO SAIR -->
    @if (confirmLogoutOpen) {
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmação de saída"
    >
      <!-- overlay -->
      <div class="absolute inset-0 bg-black/40" (click)="closeLogoutConfirm()"></div>

      <!-- modal -->
      <div
        class="relative w-full max-w-sm rounded-xl bg-white border border-gray-200 shadow-xl p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-gray-900">Deseja realmente sair?</h2>
            <p class="text-sm text-gray-600 mt-1">
              Você precisará fazer login novamente para acessar checkout e pedidos.
            </p>
          </div>

          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 transition"
            (click)="closeLogoutConfirm()"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div class="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
            (click)="closeLogoutConfirm()"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            (click)="confirmLogout()"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
    } `,
})
export class HeaderComponent implements OnDestroy {
  menuOpen = false;
  profileOpen = false;

  confirmLogoutOpen = false;

  // scroll lock state
  private bodyLocked = false;
  private prevBodyOverflow = '';
  private prevBodyPaddingRight = '';

  constructor(public cart: CartService, public auth: AuthService, private router: Router) {}

  ngOnDestroy(): void {
    // garante que não deixa o body travado ao destruir o componente
    this.unlockBodyScroll();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) this.profileOpen = false;
  }

  closeAll() {
    this.menuOpen = false;
    this.profileOpen = false;
  }

  toggleProfileMenu(ev: MouseEvent) {
    ev.stopPropagation();
    this.profileOpen = !this.profileOpen;
    if (this.profileOpen) this.menuOpen = false;
  }

  openLogoutConfirm() {
    this.closeAll();
    this.confirmLogoutOpen = true;
    this.lockBodyScroll();
  }

  closeLogoutConfirm() {
    this.confirmLogoutOpen = false;
    this.unlockBodyScroll();
  }

  confirmLogout() {
    this.confirmLogoutOpen = false;
    this.unlockBodyScroll();
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // fecha dropdown ao clicar fora (mas não mexe no modal)
  @HostListener('document:click')
  onDocClick() {
    if (this.profileOpen) this.profileOpen = false;
  }

  // ESC fecha modal se aberto; senão fecha menus
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.confirmLogoutOpen) {
      this.closeLogoutConfirm();
      return;
    }
    this.closeAll();
  }

  // ---------- body scroll lock ----------
  private lockBodyScroll(): void {
    if (this.bodyLocked) return;

    const body = document.body;
    const docEl = document.documentElement;

    // salva estado atual
    this.prevBodyOverflow = body.style.overflow;
    this.prevBodyPaddingRight = body.style.paddingRight;

    // evita "pulo" quando some a scrollbar
    const scrollbarWidth = window.innerWidth - docEl.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    body.style.overflow = 'hidden';
    this.bodyLocked = true;
  }

  private unlockBodyScroll(): void {
    if (!this.bodyLocked) return;

    const body = document.body;
    body.style.overflow = this.prevBodyOverflow;
    body.style.paddingRight = this.prevBodyPaddingRight;

    this.bodyLocked = false;
  }

  get displayName(): string {
    // Ajuste conforme o que o AuthService expõe.
    // Fallbacks comuns:
    const user: any =
      (this.auth as any).user?.() ??
      (this.auth as any).currentUser?.() ??
      (this.auth as any).getUser?.() ??
      (this.auth as any).user ??
      null;

    const name = user?.name ?? user?.fullName ?? user?.firstName ?? user?.email ?? '';

    return String(name || 'usuário').split(' ')[0]; // pega só o primeiro nome
  }
}
