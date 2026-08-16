import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="pc-card card-hover group"
      role="link"
      tabindex="0"
      [attr.aria-label]="'Abrir produto: ' + (product.name || 'Produto')"
      (click)="openProduct()"
      (keydown.enter)="openProduct()"
      (keydown.space)="openProduct(); $event.preventDefault()"
    >
      <div class="pc-media">
        @if (categoryName) {
        <span class="pc-cat badge-lime">{{ categoryName }}</span>
        }

        @if (product.stock <= 0) {
        <span class="pc-stock badge-red">Esgotado</span>
        }

        <img
          class="pc-img"
          [src]="imageUrl(product)"
          [alt]="product.name || 'Produto'"
          loading="lazy"
          (error)="onImgError($event)"
        />
      </div>

      <div class="pc-body">
        <div class="pc-top">
          <h3 class="pc-title clamp-2">{{ product.name }}</h3>

          @if (product.description) {
          <p class="pc-desc clamp-2">{{ product.description }}</p>
          }
        </div>

        <div class="pc-bottom">
          <div class="pc-price">{{ formatPrice(product.price) }}</div>

          <button
            type="button"
            class="pc-btn"
            [disabled]="product.stock <= 0"
            (click)="addToCart($event)"
            aria-label="Adicionar ao carrinho"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="20" cy="21" r="1.5" />
              <path d="M1.5 2.5h2.2l2.1 12.1a2.2 2.2 0 0 0 2.2 1.8h9.7a2.2 2.2 0 0 0 2.2-1.7l1.2-7.3H6.1" />
            </svg>
            Adicionar
          </button>
        </div>
      </div>
    </article>
  `,
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  constructor(private router: Router, private cart: CartService) {}

  get categoryName(): string {
    return this.product.categories?.[0]?.name ?? '';
  }

  openProduct() {
    this.router.navigate(['/products', this.product.id]);
  }

  addToCart(event: MouseEvent) {
    event.stopPropagation();

    const anyCart = this.cart as any;

    if (typeof anyCart.add === 'function') return anyCart.add(this.product);
    if (typeof anyCart.addItem === 'function') return anyCart.addItem(this.product);
    if (typeof anyCart.addToCart === 'function') return anyCart.addToCart(this.product);
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
    (ev.target as HTMLImageElement).src = 'https://placehold.co/800?text=Imagem&font=roboto';
  }
}
