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
    <section class="min-h-[calc(100vh-56px)] flex items-start justify-center pt-10 px-4 sm:px-6">
      <div class="w-full max-w-5xl space-y-6">
        <!-- Alert: tentou iniciar checkout com carrinho vazio -->
        @if (showEmptyCheckoutNotice && cart.items().length === 0) {
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="text-sm text-amber-900">
              <span class="font-semibold">Não dá pra iniciar o checkout</span> com o carrinho vazio.
              Adicione pelo menos um item para continuar.
            </div>

            <button
              type="button"
              class="text-sm font-medium text-amber-900/80 hover:text-amber-900 transition"
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
            <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">Carrinho</h1>
            <p class="text-sm text-gray-500 mt-1">Revise seus itens antes de finalizar a compra.</p>
          </div>

          <button
            type="button"
            class="hidden sm:inline-flex px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
            (click)="goToProducts()"
          >
            Continuar comprando
          </button>
        </header>

        @if (cart.items().length === 0) {
        <!-- Empty state -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <div class="flex items-start gap-4">
            <div
              class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl"
            >
              🛒
            </div>

            <div class="flex-1">
              <h2 class="text-lg font-semibold text-gray-900">Seu carrinho está vazio</h2>
              <p class="text-sm text-gray-600 mt-1">Adicione produtos para continuar.</p>

              <div class="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  class="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition sm:w-auto"
                  (click)="goToProducts()"
                >
                  Ver produtos
                </button>

                <button
                  type="button"
                  class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition sm:w-auto"
                  (click)="goHome()"
                >
                  Voltar para o início
                </button>
              </div>
            </div>
          </div>
        </div>
        } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Items -->
          <div class="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Itens</h2>
              <span class="text-sm text-gray-500"> {{ cart.totalItems() }} unidade(s) </span>
            </div>

            <div class="mt-4 divide-y divide-gray-200">
              @for (item of cart.items(); track item.product.id) {
              <div class="py-4 flex gap-4">
                <!-- Image vira link -->
                <a
                  class="h-20 w-20 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0 block cursor-pointer
                             hover:border-gray-300 hover:bg-gray-100 transition"
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
                  <div
                    class="h-full w-full flex items-center justify-center text-gray-400 text-xs font-medium"
                  >
                    Sem imagem
                  </div>
                  }
                </a>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <a
                        [routerLink]="['/products', item.product.id]"
                        class="block w-full font-medium text-gray-900 truncate cursor-pointer
                                   hover:underline decoration-gray-300 underline-offset-4 transition"
                        [title]="item.product.name"
                        aria-label="Abrir produto"
                      >
                        {{ item.product.name }}
                      </a>

                      <p class="text-sm text-gray-500 mt-1">
                        Unitário:
                        <span class="text-gray-700">R$ {{ money(item.product.price) }}</span>
                      </p>
                    </div>

                    <!-- ✅ hit-area maior sem mudar visual -->
                    <button
                      type="button"
                      class="shrink-0 -mr-2 -mt-1 px-2 py-1 rounded-md
                                 text-sm font-medium text-red-600
                                 hover:text-red-700 hover:bg-red-50 transition"
                      (click)="openRemoveConfirm(item.product.id)"
                      aria-label="Remover item"
                    >
                      Remover
                    </button>
                  </div>

                  <div class="mt-3 flex items-center justify-between gap-4">
                    <!-- Qty stepper -->
                    <div
                      class="inline-flex items-center rounded-md border border-gray-200 bg-white overflow-hidden"
                    >
                      <button
                        type="button"
                        class="h-9 w-9 grid place-items-center hover:bg-gray-50 transition"
                        (click)="decrease(item.product.id)"
                        aria-label="Diminuir quantidade"
                      >
                        —
                      </button>

                      <div
                        class="h-9 px-3 grid place-items-center text-sm font-semibold text-gray-900"
                      >
                        {{ item.quantity }}
                      </div>

                      <button
                        type="button"
                        class="h-9 w-9 grid place-items-center hover:bg-gray-50 transition"
                        (click)="increase(item.product.id)"
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>

                    <!-- Subtotal -->
                    <div class="text-right">
                      <p class="text-xs text-gray-500">Subtotal</p>
                      <p class="text-base font-semibold text-gray-900">
                        R$ {{ money(lineTotal(item.quantity, item.product.price)) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              }
            </div>

            <div
              class="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
            >
              <button
                type="button"
                class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
                (click)="goToProducts()"
              >
                + Adicionar mais itens
              </button>

              <button
                type="button"
                class="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 transition"
                (click)="openClearConfirm()"
              >
                Limpar carrinho
              </button>
            </div>
          </div>

          <!-- Summary -->
          <aside class="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-1 h-fit">
            <h2 class="text-lg font-semibold text-gray-900">Resumo</h2>

            <div class="mt-4 space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-medium text-gray-900">R$ {{ money(cart.totalPrice()) }}</span>
              </div>

              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Frete</span>
                <span class="text-gray-500">Calculado no checkout</span>
              </div>

              <div class="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span class="text-gray-900 font-semibold">Total</span>
                <span class="text-xl font-bold text-gray-900">
                  R$ {{ money(cart.totalPrice()) }}
                </span>
              </div>

              <button
                type="button"
                class="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                (click)="goToCheckout()"
              >
                Finalizar compra
              </button>

              <button
                type="button"
                class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition w-full"
                (click)="goToProducts()"
              >
                Continuar comprando
              </button>

              <p class="text-xs text-gray-500 leading-relaxed">
                Login só será exigido ao entrar no checkout.
              </p>
            </div>
          </aside>
        </div>
        }
      </div>
    </section>

    <!-- MODAL PREMIUM (reutilizado) -->
    @if (confirmOpen) {
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmação"
    >
      <div class="absolute inset-0 bg-black/40" (click)="closeConfirm()"></div>

      <div
        class="relative w-full max-w-sm rounded-xl bg-white border border-gray-200 shadow-xl p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-gray-900">{{ confirmTitle }}</h2>
            <p class="text-sm text-gray-600 mt-1">
              {{ confirmMessage }}
            </p>
          </div>

          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 transition"
            (click)="closeConfirm()"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div class="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
            (click)="closeConfirm()"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            (click)="confirm()"
          >
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
