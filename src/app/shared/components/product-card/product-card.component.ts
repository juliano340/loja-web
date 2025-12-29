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
      class="pc-card"
      role="link"
      tabindex="0"
      [attr.aria-label]="'Abrir produto: ' + (product.name || 'Produto')"
      (click)="openProduct()"
      (keydown.enter)="openProduct()"
      (keydown.space)="openProduct(); $event.preventDefault()"
    >
      <div class="pc-media">
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
          } @else {
          <p class="pc-desc pc-desc--muted">Sem descrição.</p>
          }
        </div>

        <div class="pc-bottom">
          <div class="pc-price">{{ formatPrice(product.price) }}</div>

          <button
            type="button"
            class="pc-btn"
            (click)="addToCart($event)"
            aria-label="Adicionar ao carrinho"
          >
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

  openProduct() {
    this.router.navigate(['/products', this.product.id]);
  }

  addToCart(event: MouseEvent) {
    event.stopPropagation();

    const anyCart = this.cart as any;

    if (typeof anyCart.add === 'function') return anyCart.add(this.product);
    if (typeof anyCart.addItem === 'function') return anyCart.addItem(this.product);
    if (typeof anyCart.addToCart === 'function') return anyCart.addToCart(this.product);

    console.warn('CartService não possui método add/addItem/addToCart.');
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
