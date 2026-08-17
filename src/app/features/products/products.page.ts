import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductsService, Product } from '../../core/services/products.service';
import { CategoriesService, Category } from '../../core/services/categories.service';

type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'nameAsc';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [ProductCardComponent, FormsModule],
  template: `
    <!-- PROMO BANNER -->
    <section class="bg-ink-950 text-white text-center py-3 text-sm">
      <p>🔥 Frete grátis acima de R$ 199 · <span class="text-accent-400 font-bold">PIX com desconto</span> · Compra 100% segura</p>
    </section>

    <section class="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p class="section-kicker">Catálogo</p>
          <h1 class="section-title !text-4xl">Produtos</h1>
          <p class="text-sm text-ink-500 mt-2">
            {{ filteredProducts().length }} produto(s) disponíve{{ filteredProducts().length === 1 ? 'l' : 'is' }}
            @if (selectedCategorySlug) {
              <span class="text-brand-600 font-medium"> · {{ getSelectedCategoryName() }}</span>
            }
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div class="relative w-full sm:w-72">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              class="w-full border border-ink-200 rounded-lg pl-9 pr-3.5 py-2.5 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              type="search"
              placeholder="Buscar produto..."
              [(ngModel)]="query"
            />
          </div>

          <select
            class="w-full sm:w-48 border border-ink-200 rounded-lg px-3.5 py-2.5 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            [(ngModel)]="sortKey"
          >
            <option value="relevance">Relevância</option>
            <option value="nameAsc">Nome (A–Z)</option>
            <option value="priceAsc">Menor preço</option>
            <option value="priceDesc">Maior preço</option>
          </select>
        </div>
      </div>

      <!-- Category Chips -->
      @if (!loading && categories.length > 0) {
      <div class="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition border"
          [class]="selectedCategorySlug === '' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-700 border-ink-200 hover:border-brand-300 hover:text-brand-700'"
          (click)="selectedCategorySlug = ''"
        >
          Todos
        </button>
        @for (c of categories; track c.id) {
        <button
          class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition border"
          [class]="selectedCategorySlug === c.slug ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-700 border-ink-200 hover:border-brand-300 hover:text-brand-700'"
          (click)="selectedCategorySlug = c.slug"
        >
          {{ c.name }}
          <span class="ml-1 text-xs opacity-70">({{ categoryCount(c.id) }})</span>
        </button>
        }
      </div>
      }

      <!-- States -->
      @if (loading) {
      <div class="py-10">
        <div
          class="grid gap-5"
          [style.gridTemplateColumns]="'repeat(auto-fill, minmax(220px, 1fr))'"
        >
          @for (i of skeleton; track i) {
          <div class="skeleton h-[340px]">
            <div class="skeleton-shimmer"></div>
          </div>
          }
        </div>
      </div>
      } @else if (error) {
      <div class="py-10">
        <div class="card !max-w-md mx-auto text-center">
          <div class="h-16 w-16 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mb-4">⚠️</div>
          <p class="text-base font-bold text-ink-900 mb-1">
            Não foi possível carregar os produtos.
          </p>
          <p class="text-sm text-ink-500 mb-4">Verifique sua conexão e tente novamente.</p>
          <button class="btn-primary" (click)="reload()">Recarregar</button>
        </div>
      </div>
      } @else if (filteredProducts().length === 0) {
      <div class="py-10">
        <div class="empty-state !max-w-md mx-auto text-center">
          <div class="h-16 w-16 mx-auto rounded-2xl bg-ink-100 text-ink-400 flex items-center justify-center text-3xl mb-4">🔍</div>
          <p class="text-base font-bold text-ink-900 mb-1">Nenhum produto encontrado.</p>
          <p class="text-sm text-ink-500 mb-4">Tente mudar a busca ou a categoria.</p>
          <button class="btn-secondary" (click)="clearFilters()">Limpar filtros</button>
        </div>
      </div>
      } @else {
        <!-- Em Destaque (top 4 only when no filter active) -->
        @if (!query && !selectedCategorySlug && topProducts.length > 0) {
        <div class="mb-10">
          <div class="flex items-end justify-between mb-5">
            <div>
              <p class="section-kicker">Mais populares</p>
              <h2 class="font-display text-2xl font-extrabold text-ink-950">Em destaque</h2>
            </div>
          </div>
          <div class="grid gap-5" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
            @for (product of topProducts; track product.id) {
            <app-product-card [product]="product" />
            }
          </div>
        </div>

        <div class="border-t border-ink-100 pt-8 mb-6">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-xl font-extrabold text-ink-950">Todos os produtos</h2>
            <span class="text-sm text-ink-400">{{ filteredProducts().length }} itens</span>
          </div>
        </div>
        }

        <!-- Grid -->
        <div class="grid gap-5" [style.gridTemplateColumns]="'repeat(auto-fill, minmax(220px, 1fr))'">
          @for (product of (query || selectedCategorySlug ? filteredProducts() : remainingProducts); track product.id) {
          <app-product-card [product]="product" />
          }
        </div>

        <!-- Produtos por página -->
        <div class="mt-10 text-center">
          <p class="text-sm text-ink-400">
            Mostrando {{ (query || selectedCategorySlug ? filteredProducts() : remainingProducts).length }} de {{ filteredProducts().length }} produtos
          </p>
        </div>
      }
    </section>
  `,
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  loading = true;
  error = false;

  query = '';
  selectedCategorySlug = '';
  sortKey: SortKey = 'relevance';

  skeleton = Array.from({ length: 8 }, (_, i) => i);

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const categoria = params.get('categoria');
      if (categoria) {
        this.selectedCategorySlug = categoria;
      }
    });

    this.load();
  }

  reload() {
    this.load();
  }

  clearFilters() {
    this.query = '';
    this.selectedCategorySlug = '';
    this.sortKey = 'relevance';
  }

  getSelectedCategoryName(): string {
    const cat = this.categories.find(c => c.slug === this.selectedCategorySlug);
    return cat?.name ?? '';
  }

  categoryCount(id: string): number {
    return this.products.filter(p =>
      (p as any).categories?.some((c: any) => c.id === id)
    ).length;
  }

  get topProducts(): Product[] {
    return this.products.filter(p => p.stock > 0).slice(0, 4);
  }

  get remainingProducts(): Product[] {
    const topIds = new Set(this.topProducts.map(p => p.id));
    return this.products.filter(p => !topIds.has(p.id));
  }

  private load() {
    this.loading = true;
    this.error = false;

    forkJoin({
      products: this.productsService.findAll(),
      categories: this.categoriesService.findAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ products, categories }) => {
        this.products = products ?? [];

        this.categories = (
          categories?.length ? categories : this.deriveCategoriesFromProducts(this.products)
        ).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  private deriveCategoriesFromProducts(products: Product[]): Category[] {
    const map = new Map<string, Category>();
    for (const p of products ?? []) {
      for (const c of (p as any).categories ?? []) {
        if (c?.id && !map.has(c.id)) map.set(c.id, c);
      }
    }
    return Array.from(map.values());
  }

  private toPriceNumber(p: Product): number {
    const v: any = (p as any).price;
    const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }

  filteredProducts(): Product[] {
    const q = this.query.trim().toLowerCase();
    const cat = this.selectedCategorySlug;

    let list = this.products;

    if (cat) {
      list = list.filter((p) => {
        const categories = (p as any).categories ?? [];
        return categories.some((c: any) => String(c?.slug ?? '') === cat);
      });
    }

    if (q) {
      list = list.filter((p) => {
        const name = String((p as any).name ?? '').toLowerCase();
        const desc = String((p as any).description ?? '').toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    if (this.sortKey === 'nameAsc') {
      list = [...list].sort((a, b) =>
        String((a as any).name ?? '').localeCompare(String((b as any).name ?? ''))
      );
    }

    if (this.sortKey === 'priceAsc') {
      list = [...list].sort((a, b) => this.toPriceNumber(a) - this.toPriceNumber(b));
    }

    if (this.sortKey === 'priceDesc') {
      list = [...list].sort((a, b) => this.toPriceNumber(b) - this.toPriceNumber(a));
    }

    return list;
  }
}
