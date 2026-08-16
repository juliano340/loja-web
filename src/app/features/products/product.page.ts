import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService, Product } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      <nav class="flex items-center gap-2 text-sm text-ink-500 mb-6" aria-label="Breadcrumb">
        <a routerLink="/" class="hover:text-brand-700">Home</a>
        <span aria-hidden="true">/</span>
        <a routerLink="/products" class="hover:text-brand-700">Produtos</a>
        @if (product) {
        <span aria-hidden="true">/</span>
        <span class="text-ink-800 font-medium truncate">{{ product.name }}</span>
        }
      </nav>

      @if (loading) {
      <div class="grid gap-6 md:grid-cols-2">
        <div class="skeleton h-[420px]">
          <div class="skeleton-shimmer"></div>
        </div>
        <div class="skeleton h-[420px]">
          <div class="skeleton-shimmer"></div>
        </div>
      </div>
      } @else if (error || !product) {
      <div class="py-10">
        <div class="empty-state !max-w-md mx-auto">
          <p class="empty-state-title">Produto não encontrado.</p>
          <p class="empty-state-text">Verifique o link ou volte para a listagem.</p>
          <a routerLink="/products" class="btn-primary !w-auto inline-flex">Voltar</a>
        </div>
      </div>
      } @else {
      <div class="grid gap-8 md:grid-cols-2 items-start">
        <!-- Imagem -->
        <div class="bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(11,14,19,0.06)]">
          <div class="bg-ink-50 h-[420px]">
            <img
              class="w-full h-full object-cover"
              [src]="imageUrl(product)"
              [alt]="product.name"
              loading="lazy"
              referrerpolicy="no-referrer"
              (error)="onImgError($event)"
            />
          </div>
        </div>

        <!-- Detalhes -->
        <div class="bg-white border border-ink-100 rounded-2xl p-8 shadow-[0_1px_3px_rgba(11,14,19,0.06)]">
          <div class="flex items-center gap-2 mb-3">
            @if (categoryName) {
            <span class="badge-lime">{{ categoryName }}</span>
            }
            @if (product.stock > 0) {
            <span class="badge-green">Em estoque ({{ product.stock }})</span>
            } @else {
            <span class="badge-red">Esgotado</span>
            }
          </div>

          <h1 class="font-display text-3xl font-extrabold text-ink-950 tracking-tight">
            {{ product.name }}
          </h1>

          <p class="text-ink-500 mt-3 leading-relaxed">
            {{ product.description || 'Sem descrição no momento.' }}
          </p>

          <div class="mt-6">
            <div class="font-display text-4xl font-black text-brand-600">
              {{ formatPrice(product.price) }}
            </div>
            <p class="text-xs text-ink-500 mt-1">
              Em até <span class="font-semibold text-ink-800">3x</span> sem juros · PIX com
              <span class="font-semibold text-ink-800">5% off</span>
            </p>
          </div>

          <div class="mt-8 flex items-center gap-3">
            <button
              type="button"
              class="qty-btn"
              (click)="decQty()"
              aria-label="Diminuir quantidade"
            >
              −
            </button>

            <div
              class="h-10 w-14 flex items-center justify-center border border-ink-200 rounded-lg bg-white font-bold text-ink-900"
            >
              {{ qty }}
            </div>

            <button
              type="button"
              class="qty-btn"
              (click)="incQty()"
              aria-label="Aumentar quantidade"
            >
              +
            </button>

            <button
              type="button"
              class="btn-primary flex-1 !py-3"
              [disabled]="product.stock <= 0"
              (click)="addToCart(product)"
            >
              Adicionar ao carrinho
            </button>
          </div>

          <div class="mt-4 flex gap-3">
            <a routerLink="/cart" class="btn-secondary !w-full">Ver carrinho</a>
            <a
              routerLink="/checkout"
              class="btn-accent !w-full"
              [attr.aria-disabled]="product.stock <= 0"
            >
              Ir para checkout
            </a>
          </div>

          <div class="mt-8 border-t border-ink-100 pt-5 space-y-3 text-sm">
            <div class="flex items-center gap-3 text-ink-600">
              <span class="flex items-center justify-center h-8 w-8 rounded-full bg-accent-100 text-accent-700" aria-hidden="true">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              Compra segura processada via Stripe
            </div>
            <div class="flex items-center gap-3 text-ink-600">
              <span class="flex items-center justify-center h-8 w-8 rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </span>
              Envio rápido para todo o Brasil
            </div>
          </div>
        </div>
      </div>
      }
    </section>
  `,
})
export class ProductPage implements OnInit {
  product: Product | null = null;
  loading = true;
  error = false;

  qty = 1;

  get categoryName(): string {
    return this.product?.categories?.[0]?.name ?? '';
  }

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loading = false;
      this.error = true;
      return;
    }

    this.productsService.findOne(id).subscribe({
      next: (p) => {
        this.product = p ?? null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  incQty() {
    this.qty = Math.min(99, this.qty + 1);
  }

  decQty() {
    this.qty = Math.max(1, this.qty - 1);
  }

  addToCart(product: Product) {
    // ✅ agora funciona de verdade
    this.cart.add(product, this.qty);
    // opcional: resetar depois de adicionar
    // this.qty = 1;
  }

  formatPrice(value: any): string {
    const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
    const safe = Number.isFinite(n) ? n : 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe);
  }

  imageUrl(p: any): string {
    return (
      p?.imageUrl ||
      p?.image ||
      p?.thumbnail ||
      p?.photoUrl ||
      'https://placehold.co/800?text=Imagem&font=roboto'
    );
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.src = 'https://placehold.co/800?text=Imagem&font=roboto';
  }
}
