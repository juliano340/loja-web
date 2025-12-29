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
    <section class="max-w-6xl mx-auto px-4 py-6 sm:px-6">
      <div class="flex items-center justify-between mb-6">
        <a routerLink="/products" class="text-sm text-gray-600 hover:text-gray-900">
          ← Voltar para produtos
        </a>
      </div>

      @if (loading) {
      <div class="grid gap-6 md:grid-cols-2">
        <div class="bg-white border border-gray-200 rounded-xl h-[320px]"></div>
        <div class="bg-white border border-gray-200 rounded-xl p-6 h-[320px]"></div>
      </div>
      } @else if (error || !product) {
      <div class="bg-white border border-gray-200 rounded-xl p-6 max-w-md">
        <p class="text-base font-semibold text-gray-900 mb-1">Produto não encontrado.</p>
        <p class="text-sm text-gray-600 mb-4">Verifique o link ou volte para a listagem.</p>
        <a routerLink="/products" class="btn-primary inline-block text-center">Voltar</a>
      </div>
      } @else {
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Imagem -->
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div class="bg-gray-100 h-[320px]">
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
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h1 class="text-2xl font-semibold text-gray-900">{{ product.name }}</h1>

          <p class="text-gray-600 mt-2 leading-relaxed">
            {{ product.description || 'Sem descrição no momento.' }}
          </p>

          <div class="mt-5 flex items-center justify-between">
            <div class="text-xl font-bold text-gray-900">{{ formatPrice(product.price) }}</div>
            <div class="text-xs text-gray-500">ID: {{ product.id }}</div>
          </div>

          <div class="mt-6 flex items-center gap-3">
            <button
              type="button"
              class="h-10 w-10 rounded-md border border-gray-300 hover:bg-gray-50"
              (click)="decQty()"
              aria-label="Diminuir quantidade"
            >
              −
            </button>

            <div
              class="h-10 w-14 flex items-center justify-center border border-gray-300 rounded-md bg-white"
            >
              {{ qty }}
            </div>

            <button
              type="button"
              class="h-10 w-10 rounded-md border border-gray-300 hover:bg-gray-50"
              (click)="incQty()"
              aria-label="Aumentar quantidade"
            >
              +
            </button>

            <button type="button" class="btn-primary flex-1" (click)="addToCart(product)">
              Adicionar ao carrinho
            </button>
          </div>

          <div class="mt-4 flex gap-3">
            <a
              routerLink="/cart"
              class="w-full text-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Ver carrinho
            </a>
            <a
              routerLink="/checkout"
              class="w-full text-center px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-black"
            >
              Ir para checkout
            </a>
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
