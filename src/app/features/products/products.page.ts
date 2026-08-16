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
    <section class="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p class="section-kicker">Catálogo</p>
          <h1 class="section-title !text-4xl">Produtos</h1>
          <p class="text-sm text-ink-500 mt-2">
            {{ filteredProducts().length }} produto(s) disponíve{{ filteredProducts().length === 1 ? 'l' : 'is' }}.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            class="w-full sm:w-72 border border-ink-200 rounded-lg px-3.5 py-2.5 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            type="search"
            placeholder="Buscar produto..."
            [(ngModel)]="query"
          />

          <!-- Categoria -->
          <select
            class="w-full sm:w-56 border border-ink-200 rounded-lg px-3.5 py-2.5 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            [(ngModel)]="selectedCategorySlug"
          >
            <option value="">Todas categorias</option>
            @for (c of categories; track c.id) {
            <option [value]="c.slug">{{ c.name }}</option>
            }
          </select>

          <!-- Ordenação -->
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

      <!-- States -->
      @if (loading) {
      <div class="py-10">
        <div
          class="grid gap-5"
          [style.gridTemplateColumns]="'repeat(auto-fill, minmax(220px, 1fr))'"
        >
          @for (i of skeleton; track i) {
          <div class="skeleton h-[320px]">
            <div class="skeleton-shimmer"></div>
          </div>
          }
        </div>
      </div>
      } @else if (error) {
      <div class="py-10">
        <div class="card !max-w-md">
          <p class="text-base font-bold text-ink-900 mb-1">
            Não foi possível carregar os produtos.
          </p>
          <p class="text-sm text-ink-500 mb-4">Tente novamente.</p>
          <button class="btn-primary" (click)="reload()">Recarregar</button>
        </div>
      </div>
      } @else if (filteredProducts().length === 0) {
      <div class="py-10">
        <div class="empty-state !max-w-md mx-auto">
          <p class="empty-state-title">Nenhum produto encontrado.</p>
          <p class="empty-state-text">Tente mudar a busca, a categoria ou a ordenação.</p>
          <button class="btn-primary" (click)="clearFilters()">Limpar filtros</button>
        </div>
      </div>
      } @else {
      <!-- Grid -->
      <div class="grid gap-5" [style.gridTemplateColumns]="'repeat(auto-fill, minmax(220px, 1fr))'">
        @for (product of filteredProducts(); track product.id) {
        <app-product-card [product]="product" />
        }
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
  selectedCategorySlug = ''; // 👈 novo
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

  private load() {
    this.loading = true;
    this.error = false;

    forkJoin({
      products: this.productsService.findAll(),
      categories: this.categoriesService.findAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ products, categories }) => {
        this.products = products ?? [];

        // Se o /categories falhar, deriva a lista a partir dos produtos
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

    // filtro por categoria (se selecionada)
    if (cat) {
      list = list.filter((p) => {
        const categories = (p as any).categories ?? [];
        return categories.some((c: any) => String(c?.slug ?? '') === cat);
      });
    }

    // filtro por busca
    if (q) {
      list = list.filter((p) => {
        const name = String((p as any).name ?? '').toLowerCase();
        const desc = String((p as any).description ?? '').toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    // ordenação
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
