import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductsService, Product } from '../../core/services/products.service';
import { CategoriesService, Category } from '../../core/services/categories.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <!-- HERO -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(132,204,22,0.22),transparent_50%)]"
        aria-hidden="true"
      ></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p class="section-kicker !text-accent-400">Fitness & Fisioterapia</p>
          <h1 class="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight mt-3">
            TREINE PESADO,<br />
            <span class="text-brand-500">RECUPERE RÁPIDO.</span>
          </h1>
          <p class="mt-5 text-ink-300 text-lg leading-relaxed max-w-md">
            Equipamentos selecionados pra você manter a constância — do treino de força à
            fisioterapia.
          </p>

          <div class="mt-8 flex flex-col sm:flex-row gap-3">
            <a routerLink="/products" class="btn-accent !px-7 !py-3 !text-base"> Ver produtos </a>
            <a routerLink="/products" class="btn !px-7 !py-3 !text-base bg-white/10 text-white hover:bg-white/20 border border-white/20">
              Explorar categorias
            </a>
          </div>

          <div class="mt-10 flex items-center gap-6 text-sm">
            <div class="flex -space-x-2" aria-hidden="true">
              @for (dot of heroDots; track $index) {
              <span
                class="inline-block rounded-full border-2 border-ink-950"
                [style.background]="dot"
                style="width:32px;height:32px"
              ></span>
              }
            </div>
            <p class="text-ink-400">
              <span class="font-bold text-white">+{{ totalStock }}</span> itens em estoque
            </p>
          </div>
        </div>

        <!-- Imagem do produto em destaque -->
        <div class="relative hidden md:flex items-center justify-center">
          <div
            class="absolute w-80 h-80 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 opacity-20 blur-3xl"
            aria-hidden="true"
          ></div>
          @if (featuredImage) {
          <img
            [src]="featuredImage"
            alt="Produto em destaque"
            class="relative w-full max-w-md aspect-square object-cover rounded-3xl shadow-2xl ring-1 ring-white/20 rotate-2 hover:rotate-0 transition duration-500"
          />
          }
        </div>
      </div>
    </section>

    <!-- TRUST BADGES -->
    <section class="border-b border-ink-100 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center h-11 w-11 rounded-xl bg-accent-100 text-accent-700" aria-hidden="true">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <div>
            <p class="text-sm font-bold text-ink-950">Pagamento seguro</p>
            <p class="text-xs text-ink-500">PIX e cartão via Stripe</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center h-11 w-11 rounded-xl bg-brand-100 text-brand-700" aria-hidden="true">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </span>
          <div>
            <p class="text-sm font-bold text-ink-950">Frete rápido</p>
            <p class="text-xs text-ink-500">Grátis acima de R$ 199</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center h-11 w-11 rounded-xl bg-ink-100 text-ink-800" aria-hidden="true">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </span>
          <div>
            <p class="text-sm font-bold text-ink-950">Qualidade selecionada</p>
            <p class="text-xs text-ink-500">Produtos pra sua evolução</p>
          </div>
        </div>
      </div>
    </section>

    <!-- DESTAQUES -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="section-kicker">Os queridinhos</p>
          <h2 class="section-title">Em destaque</h2>
        </div>
        <a routerLink="/products" class="link-btn">Ver todos →</a>
      </div>

      @if (loading) {
      <div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
        @for (i of skeleton; track i) {
        <div class="skeleton h-[320px]">
          <div class="skeleton-shimmer"></div>
        </div>
        }
      </div>
      } @else {
      <div class="grid gap-5" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
        @for (product of featured; track product.id) {
        <app-product-card [product]="product" />
        }
      </div>
      }
    </section>

    <!-- CATEGORIAS -->
    @if (categories.length > 0) {
    <section class="bg-ink-950 py-14 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="mb-8">
          <p class="section-kicker !text-accent-400">Navegue por</p>
          <h2 class="font-display text-3xl font-extrabold tracking-tight">Categorias</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (cat of categories; track cat.id) {
          <a
            routerLink="/products"
            [queryParams]="{ categoria: cat.slug }"
            class="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-5 transition hover:bg-white/10 hover:border-accent-500/40"
          >
            <div>
              <p class="font-display text-lg font-bold">{{ cat.name }}</p>
              <p class="text-sm text-ink-400 mt-0.5">{{ categoryCount(cat.id) }} produto(s)</p>
            </div>
            <span
              class="flex items-center justify-center h-10 w-10 rounded-full bg-accent-500 text-ink-950 group-hover:translate-x-1 transition"
              aria-hidden="true"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </span>
          </a>
          }
        </div>
      </div>
    </section>
    }

    <!-- CTA FINAL -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div
        class="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-12 md:px-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-white"
      >
        <div>
          <h2 class="font-display text-3xl md:text-4xl font-black tracking-tight">
            Bora treinar? 🏋️
          </h2>
          <p class="mt-2 text-white/85 text-lg max-w-md">
            Monte seu carrinho e receba em casa. Comece agora.
          </p>
        </div>
        <a
          routerLink="/products"
          class="btn bg-white text-brand-700 !px-8 !py-4 !text-lg hover:bg-accent-300"
        >
          Começar agora
        </a>
      </div>
    </section>
  `,
})
export class HomePage implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  loading = true;
  skeleton = Array.from({ length: 4 }, (_, i) => i);

  heroDots = ['#f97316', '#84cc16', '#fb923c', '#a3e635'];

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    forkJoin({
      products: this.productsService.findAll().pipe(catchError(() => of([]))),
      categories: this.categoriesService.findAll().pipe(catchError(() => of([]))),
    }).subscribe(({ products, categories }) => {
      this.products = products ?? [];
      this.categories = (categories ?? []).sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '')
      );
      this.loading = false;
    });
  }

  get featured(): Product[] {
    const active = this.products.filter((p) => p.stock > 0).slice(0, 4);
    return active.length ? active : this.products.slice(0, 4);
  }

  get totalStock(): number {
    return this.products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  }

  get featuredImage(): string | null {
    const p = this.featured[0];
    return p?.imageUrl ?? null;
  }

  categoryCount(id: string): number {
    return this.products.filter((p) =>
      (p.categories ?? []).some((c) => c.id === id)
    ).length;
  }
}
