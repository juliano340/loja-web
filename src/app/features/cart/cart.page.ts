import { Component, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

type PriceLike = string | number | null | undefined;
type ConfirmAction = 'REMOVE_ITEM' | 'CLEAR_CART';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="min-h-[calc(100vh-64px)] flex items-start justify-center pt-10 pb-16 px-4 sm:px-6">
      <div class="w-full max-w-5xl space-y-6">
        <!-- Alert: tentou iniciar checkout com carrinho vazio -->
        @if (showEmptyCheckoutNotice && cart.items().length === 0) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="text-sm text-amber-900">
              <span class="font-bold">Não dá pra iniciar o checkout</span> com o carrinho vazio.
              Adicione pelo menos um item para continuar.
            </div>

            <button
              type="button"
              class="text-sm font-semibold text-amber-900/80 hover:text-amber-900 transition"
              (click)="dismissEmptyCheckoutNotice()"
              aria-label="Fechar aviso"
            >
              Fechar
            </button>
          </div>
        </div>
        }

        <!-- Topbar -->
        <header class="flex items-start justify-between gap-4">
          <div>
            <p class="section-kicker">Sua compra</p>
            <h1 class="section-title !text-3xl">Carrinho</h1>
            <p class="text-sm text-ink-500 mt-1">Revise seus itens antes de finalizar a compra.</p>
          </div>

          <button
            type="button"
            class="btn-secondary !hidden sm:!inline-flex"
            (click)="goToProducts()"
          >
            Continuar comprando
          </button>
        </header>

        @if (cart.items().length === 0) {
        <!-- Empty state -->
        <div class="empty-state !p-10">
          <div class="flex items-start gap-4 max-w-md mx-auto text-left">
            <div
              class="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl shrink-0"
              aria-hidden="true"
            >
              🛒
            </div>

            <div class="flex-1">
              <h2 class="text-lg font-bold text-ink-950">Seu carrinho está vazio</h2>
              <p class="text-sm text-ink-500 mt-1">Adicione produtos para continuar.</p>

              <div class="mt-5 flex flex-col sm:flex-row gap-3">
                <button type="button" class="btn-primary sm:!w-auto" (click)="goToProducts()">
                  Ver produtos
                </button>

                <button type="button" class="btn-secondary sm:!w-auto" (click)="goHome()">
                  Voltar para o início
                </button>
              </div>
            </div>
          </div>
        </div>
        } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Items -->
          <div class="bg-white border border-ink-100 rounded-2xl p-6 lg:col-span-2 shadow-[0_1px_3px_rgba(11,14,19,0.06)]">
            <div class="flex items-center justify-between">
              <h2 class="font-display text-lg font-extrabold text-ink-950">Itens</h2>
              <span class="badge-ink"> {{ cart.totalItems() }} unidade(s) </span>
            </div>

            <div class="mt-5 divide-y divide-ink-100">
              @for (item of cart.items(); track item.product.id) {
              <div class="py-4 flex gap-4">
                <a
                  class="h-20 w-20 rounded-xl bg-ink-50 border border-ink-100 overflow-hidden shrink-0 block cursor-pointer
                             hover:border-brand-300 transition"
                  [routerLink]="['/products', item.product.id]"
                  aria-label="Abrir produto"
                >
                  @if (item.product.imageUrl) {
                  <img
                    [src]="item.product.imageUrl"
                    [alt]="item.product.name"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                  } @else {
                  <div class="h-full w-full flex items-center justify-center text-ink-400 text-xs font-medium">
                    Sem imagem
                  </div>
                  }
                </a>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <a
                      [routerLink]="['/products', item.product.id]"
                      class="block font-semibold text-ink-950 truncate cursor-pointer
                                 hover:text-brand-700 transition"
                      [title]="item.product.name"
                      aria-label="Abrir produto"
                    >
                      {{ item.product.name }}
                    </a>

                    <button
                      type="button"
                      class="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-2 py-1 transition"
                      (click)="openRemoveConfirm(item.product.id)"
                      aria-label="Remover item"
                    >
                      Remover
                    </button>
                  </div>

                  <p class="text-sm text-ink-500 mt-1">
                    Unitário: <span class="text-ink-800">R$ {{ money(item.product.price) }}</span>
                  </p>

                  <div class="mt-3 flex items-center justify-between gap-4">
                    <div class="inline-flex items-center rounded-lg border border-ink-200 overflow-hidden">
                      <button type="button" class="qty-btn-sm rounded-none border-0" (click)="decrease(item.product.id)" aria-label="Diminuir quantidade">
                        −
                      </button>
                      <div class="h-7 px-3 flex items-center text-sm font-bold text-ink-950">
                        {{ item.quantity }}
                      </div>
                      <button type="button" class="qty-btn-sm rounded-none border-0" (click)="increase(item.product.id)" aria-label="Aumentar quantidade">
                        +
                      </button>
                    </div>

                    <div class="text-right">
                      <p class="text-xs text-ink-500">Subtotal</p>
                      <p class="text-base font-bold text-brand-700">
                        R$ {{ money(lineTotal(item.quantity, item.product.price)) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              }
            </div>

            <div class="mt-5 pt-4 border-t border-ink-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <button type="button" class="btn-secondary sm:!w-auto !text-sm" (click)="goToProducts()">
                + Adicionar mais itens
              </button>

              <button type="button" class="btn-danger-ghost" (click)="openClearConfirm()">
                Limpar carrinho
              </button>
            </div>
          </div>

          <!-- Summary -->
          <aside class="bg-white border border-ink-100 rounded-2xl p-6 lg:col-span-1 h-fit shadow-[0_1px_3px_rgba(11,14,19,0.06)] sticky top-24">
            <h2 class="font-display text-lg font-extrabold text-ink-950">Resumo</h2>

            <div class="mt-5 space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-ink-500">Subtotal</span>
                <span class="font-bold text-ink-900">R$ {{ money(cart.totalPrice()) }}</span>
              </div>

              <div class="flex items-center justify-between text-sm">
                <span class="text-ink-500">Frete</span>
                <span class="badge-lime">Calculado no checkout</span>
              </div>

              <div class="border-t border-ink-100 pt-4 flex items-center justify-between">
                <span class="font-bold text-ink-950">Total</span>
                <span class="font-display text-2xl font-black text-brand-600">
                  R$ {{ money(cart.totalPrice()) }}
                </span>
              </div>

              <button type="button" class="btn-primary" (click)="goToCheckout()">
                Finalizar compra
              </button>

              <button type="button" class="btn-secondary" (click)="goToProducts()">
                Continuar comprando
              </button>

              <p class="text-xs text-ink-500 leading-relaxed text-center">
                Login só será exigido ao entrar no checkout.
              </p>
            </div>
          </aside>
        </div>
        }
      </div>
    </section>

    <!-- MODAL PREMIUM -->
    @if (confirmOpen) {
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmação"
    >
      <div class="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" (click)="closeConfirm()"></div>

      <div class="relative w-full max-w-sm rounded-2xl bg-white border border-ink-100 shadow-2xl p-6">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-bold text-ink-950">{{ confirmTitle }}</h2>
            <p class="text-sm text-ink-500 mt-1">{{ confirmMessage }}</p>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3">
          <button type="button" class="btn-secondary !w-auto !py-2" (click)="closeConfirm()">
            Cancelar
          </button>
          <button type="button" class="btn-danger" (click)="confirm()">
            {{ confirmCta }}
          </button>
        </div>
      </div>
    </div>
    }
  `,
})
export class CartPage implements OnDestroy {
  showEmptyCheckoutNotice = false;

  confirmOpen = false;
  confirmAction: ConfirmAction = 'REMOVE_ITEM';

  confirmTitle = 'Confirmar ação';
  confirmMessage = 'Tem certeza?';
  confirmCta = 'Confirmar';

  private removeProductId: number | null = null;

  private bodyLocked = false;
  private prevBodyOverflow = '';
  private prevBodyPaddingRight = '';

  constructor(public cart: CartService, private router: Router, private route: ActivatedRoute) {
    this.showEmptyCheckoutNotice = this.route.snapshot.queryParamMap.get('emptyCheckout') === '1';
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  dismissEmptyCheckoutNotice() {
    this.showEmptyCheckoutNotice = false;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { emptyCheckout: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openRemoveConfirm(productId: number) {
    const item = this.cart.items().find((x) => x.product.id === productId);
    const name = item?.product?.name ? `“${item.product.name}”` : 'este item';

    this.confirmAction = 'REMOVE_ITEM';
    this.removeProductId = productId;

    this.confirmTitle = 'Remover item do carrinho?';
    this.confirmMessage = `Você está prestes a remover ${name}.`;
    this.confirmCta = 'Remover';

    this.openConfirm();
  }

  openClearConfirm() {
    this.confirmAction = 'CLEAR_CART';
    this.removeProductId = null;

    this.confirmTitle = 'Limpar carrinho?';
    this.confirmMessage = 'Isso removerá todos os itens do carrinho.';
    this.confirmCta = 'Limpar';

    this.openConfirm();
  }

  private openConfirm() {
    this.confirmOpen = true;
    this.lockBodyScroll();
  }

  closeConfirm() {
    this.confirmOpen = false;
    this.removeProductId = null;
    this.unlockBodyScroll();
  }

  confirm() {
    if (this.confirmAction === 'REMOVE_ITEM') {
      if (this.removeProductId != null) this.cart.remove(this.removeProductId);
      this.closeConfirm();
      return;
    }

    this.cart.clear();
    this.closeConfirm();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.confirmOpen) this.closeConfirm();
  }

  increase(productId: number) {
    this.cart.increase(productId);
  }

  decrease(productId: number) {
    const item = this.cart.items().find((x) => x.product.id === productId);
    const qty = item?.quantity ?? 0;

    if (qty <= 1) {
      this.openRemoveConfirm(productId);
      return;
    }

    this.cart.decrease(productId);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  private toNumber(value: PriceLike): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const raw = (value ?? '').toString().trim();
    const normalized = raw.replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  money(value: PriceLike): string {
    return this.toNumber(value).toFixed(2);
  }

  lineTotal(quantity: number, unitPrice: PriceLike): number {
    return quantity * this.toNumber(unitPrice);
  }

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
}
