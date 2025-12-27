import { Component, Input } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
    <div class="card">
      <img
        [src]="product.imageUrl || 'https://via.placeholder.com/300x200'"
        alt="{{ product.name }}"
      />

      <h2>{{ product.name }}</h2>
      <p class="desc">{{ product.description }}</p>
      <strong>R$ {{ product.price }}</strong>

      <button (click)="add()">Adicionar ao carrinho</button>
    </div>
  `,
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  constructor(private cartService: CartService) {}

  add() {
    this.cartService.add(this.product);
  }
}
