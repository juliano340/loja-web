import { Component, OnInit } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductsService, Product } from '../../core/services/products.service';

@Component({
  selector: 'app-products-page',
  imports: [ProductCardComponent],
  template: `
    <h1>Produtos</h1>

    @if (loading) {
    <p>Carregando produtos...</p>
    } @else {
    <div class="grid">
      @for (product of products; track product.id) {
      <app-product-card [product]="product" />
      }
    </div>
    }
  `,
  styleUrls: ['./products.page.css'],
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  loading = true;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.productsService.findAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
