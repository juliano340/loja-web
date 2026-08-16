import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  host: {
    '(document:click)': 'onDocClick()',
    '(document:keydown.escape)': 'onEsc()',
  },
  template: `
    <div class="announce">
      🔥 <span class="announce-strong">Frete grátis</span> em compras acima de R$ 199 · Pagamento via PIX com
      <span class="announce-strong">desconto</span>
    </div>

    <header class="header">
      <div class="header-container">
        <!-- ESQUERDA -->
        <a routerLink="/" class="header-title" (click)="closeAll()">
          <span class="header-logo" aria-hidden="true">
            <span class="header-logo-mark">L</span>
          </span>
          LOJA <span class="header-brand-accent">WEB</span>
        </a>

        <!-- DIREITA -->
        <div class="header-right">
          <!-- MENU DESKTOP -->
          <nav class="header-nav" aria-label="Navegação principal">
            <a
              routerLink="/products"
              routerLinkActive="header-link-active"
              class="header-link"
              (click)="closeAll()"
              >Produtos</a
            >

            @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="header-link-active" class="header-link" (click)="closeAll()"
              >Admin</a
            >
            }

            <!-- PERFIL (dropdown) - desktop -->
            <div class="relative flex items-center gap-2">
              @if (auth.isAuthenticated()) {
              <span class="hidden md:inline text-sm text-ink-600 select-none">
                Olá, <span class="font-semibold text-ink-950">{{ displayName }}</span>
              </span>
              }

              <button
                type="button"
                class="icon-btn"
                [class.ring-2]="auth.isAuthenticated()"
                [class.ring-accent-300]="auth.isAuthenticated()"
                (click)="toggleProfileMenu($event)"
                aria-label="Menu do perfil"
                [attr.aria-expanded]="profileOpen"
              >
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
                class="absolute right-0 top-full mt-2 w-56 rounded-xl border border-ink-100 bg-white shadow-xl overflow-hidden z-50"
                role="menu"
                aria-label="Opções do perfil"
              >
                @if (auth.isAuthenticated()) {
                <a
                  routerLink="/profile"
                  class="block px-4 py-2.5 text-sm text-ink-800 hover:bg-accent-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Meu perfil
                </a>

                <a
                  routerLink="/orders"
                  class="block px-4 py-2.5 text-sm text-ink-800 hover:bg-accent-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Meus pedidos
                </a>

                @if (auth.isAdmin()) {
                <a
                  routerLink="/admin"
                  class="block px-4 py-2.5 text-sm text-ink-800 hover:bg-accent-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Admin
                </a>
                }

                <div class="border-t border-ink-100"></div>

                <button
                  type="button"
                  class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  role="menuitem"
                  (click)="openLogoutConfirm()"
                >
                  Sair
                </button>
                } @else {
                <a
                  routerLink="/login"
                  class="block px-4 py-2.5 text-sm text-ink-800 hover:bg-accent-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Entrar
                </a>

                <a
                  routerLink="/register"
                  class="block px-4 py-2.5 text-sm text-ink-800 hover:bg-accent-50 transition"
                  role="menuitem"
                  (click)="closeAll()"
                >
                  Criar conta
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
            <span class="cart-badge">{{ cart.totalItems() }}</span>
            }
          </a>

          <!-- BOTÃO MOBILE -->
          <button class="icon-btn md:hidden" (click)="toggleMenu()" aria-label="Abrir menu">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              @if (menuOpen) {
              <path d="M6 6l12 12M18 6L6 18" />
              } @else {
              <path d="M4 7h16M4 12h16M4 17h16" />
              }
            </svg>
          </button>
        </div>

        <!-- MENU MOBILE -->
        @if (menuOpen) {
        <div class="mobile-menu md:hidden">
          @if (auth.isAuthenticated()) {
          <div class="px-4 py-3 border-b border-ink-100 text-sm text-ink-600">
            Olá, <span class="font-semibold text-ink-950">{{ displayName }}</span>
          </div>
          }

          <a routerLink="/products" class="mobile-menu-item" (click)="closeAll()"> Produtos </a>

          @if (auth.isAuthenticated()) {
          @if (auth.isAdmin()) {
          <a routerLink="/admin" class="mobile-menu-item" (click)="closeAll()"> Admin </a>
          }
          <a routerLink="/orders" class="mobile-menu-item" (click)="closeAll()"> Meus pedidos </a>
          <a routerLink="/profile" class="mobile-menu-item" (click)="closeAll()"> Meu perfil </a>
          <button type="button" class="mobile-menu-item text-left" (click)="openLogoutConfirm()">
            Sair
          </button>
          } @else {
          <a routerLink="/login" class="mobile-menu-item" (click)="closeAll()"> Entrar </a>
          <a routerLink="/register" class="mobile-menu-item" (click)="closeAll()"> Criar conta </a>
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
      <div class="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" (click)="closeLogoutConfirm()"></div>

      <div
        class="relative w-full max-w-sm rounded-2xl bg-white border border-ink-100 shadow-2xl p-6"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <span
              class="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 text-red-600"
              aria-hidden="true"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M9.5 2h5M12 14v-4M7.5 21h9a2 2 0 0 0 2-2V5.5a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2z" />
              </svg>
            </span>
            <div>
              <h2 class="text-base font-bold text-ink-950">Deseja realmente sair?</h2>
              <p class="text-sm text-ink-500 mt-1">
                Você precisará fazer login novamente para acessar checkout e pedidos.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-ink-200 bg-white text-ink-800 font-semibold hover:bg-ink-50 transition"
            (click)="closeLogoutConfirm()"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
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

  onDocClick() {
    if (this.profileOpen) this.profileOpen = false;
  }

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

    this.prevBodyOverflow = body.style.overflow;
    this.prevBodyPaddingRight = body.style.paddingRight;

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
    const user: any =
      (this.auth as any).user?.() ??
      (this.auth as any).currentUser?.() ??
      (this.auth as any).getUser?.() ??
      (this.auth as any).user ??
      null;

    const name = user?.name ?? user?.fullName ?? user?.firstName ?? user?.email ?? '';

    return String(name || 'usuário').split(' ')[0];
  }
}
