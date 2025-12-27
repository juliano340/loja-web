import { Injectable, signal, computed } from '@angular/core';
import { Product } from './products.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() => this._items().reduce((acc, item) => acc + item.quantity, 0));

  readonly totalPrice = computed(() =>
    this._items().reduce((acc, item) => {
      const price = Number(item.product.price);
      return acc + price * item.quantity;
    }, 0)
  );

  add(product: Product) {
    const items = this._items();
    const existing = items.find((i) => i.product.id === product.id);

    if (existing) {
      existing.quantity++;
      this._items.set([...items]);
    } else {
      this._items.set([...items, { product, quantity: 1 }]);
    }
  }

  remove(productId: number) {
    this._items.set(this._items().filter((i) => i.product.id !== productId));
  }

  clear() {
    this._items.set([]);
  }
}
