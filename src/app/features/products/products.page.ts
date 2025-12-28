import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductsService, Product } from '../../core/services/products.service';

type SortKey = 'relevance' | 'priceAsc' | 'priceDesc' | 'nameAsc';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [ProductCardComponent, FormsModule],
  template: `
    <section class="max-w-7xl mx-auto px-4 py-6 sm:px-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Produtos</h1>
          <p class="text-sm text-gray-600 mt-1">Encontre o que você precisa com rapidez.</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            class="w-full sm:w-80 border border-gray-300 rounded-md px-3 py-2 bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="search"
            placeholder="Buscar produto..."
            [(ngModel)]="query"
          />

          <select
            class="w-full sm:w-48 border border-gray-300 rounded-md px-3 py-2 bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          class="grid gap-4"
          [style.gridTemplateColumns]="'repeat(auto-fill, minmax(220px, 1fr))'"
        >
          @for (i of skeleton; track i) {
          <div
            class="bg-white border border-gray-200 rounded-lg h-[260px] relative overflow-hidden"
          >
            <div
              class="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite]
                            bg-[linear-gradient(90deg,transparent,rgba(0,0,0,0.06),transparent)]"
            ></div>
          </div>
          }
        </div>
      </div>
      } @else if (error) {
      <div class="py-10">
        <div class="bg-white border border-gray-200 rounded-lg p-6 max-w-md">
          <p class="text-base font-semibold text-gray-900 mb-1">
            Não foi possível carregar os produtos.
          </p>
          <p class="text-sm text-gray-600 mb-4">Tente novamente.</p>
          <button class="btn-primary" (click)="reload()">Recarregar</button>
        </div>
      </div>
      } @else if (filteredProducts().length === 0) {
      <div class="py-10">
        <div class="bg-white border border-gray-200 rounded-lg p-6 max-w-md">
          <p class="text-base font-semibold text-gray-900 mb-1">Nenhum produto encontrado.</p>
          <p class="text-sm text-gray-600 mb-4">Tente mudar a busca ou a ordenação.</p>
          <button class="btn-primary" (click)="clearFilters()">Limpar filtros</button>
        </div>
      </div>
      } @else {
      <!-- Grid -->
      <div class="grid gap-4" [style.gridTemplateColumns]="'repeat(auto-fill, minmax(220px, 1fr))'">
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
  loading = true;
  error = false;

  query = '';
  sortKey: SortKey = 'relevance';

  skeleton = Array.from({ length: 8 }, (_, i) => i);

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.load();
  }

  reload() {
    this.load();
  }

  clearFilters() {
    this.query = '';
    this.sortKey = 'relevance';
  }

  private load() {
    this.loading = true;
    this.error = false;

    this.productsService.findAll().subscribe({
      next: (data) => {
        this.products = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  private toPriceNumber(p: Product): number {
    const v: any = (p as any).price;
    const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }

  filteredProducts(): Product[] {
    const q = this.query.trim().toLowerCase();

    let list = this.products;

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
