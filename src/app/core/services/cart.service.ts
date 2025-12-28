import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from './products.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

const STORAGE_KEY = 'loja.cart.v1';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() => this._items().reduce((acc, item) => acc + item.quantity, 0));

  readonly totalPrice = computed(() =>
    this._items().reduce((acc, item) => {
      const price = Number(item.product.price);
      return acc + price * item.quantity;
    }, 0)
  );

  constructor() {
    // ✅ Persistência automática
    effect(() => {
      const items = this._items();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // silencioso
      }
    });
  }

  add(product: Product) {
    const items = this._items();
    const existing = items.find((i) => i.product.id === product.id);

    if (existing) {
      existing.quantity++;
      this._items.set([...items]);
      return;
    }

    this._items.set([...items, { product, quantity: 1 }]);
  }

  increase(productId: number) {
    const items = this._items();
    const existing = items.find((i) => i.product.id === productId);
    if (!existing) return;

    existing.quantity++;
    this._items.set([...items]);
  }

  decrease(productId: number) {
    const items = this._items();
    const existing = items.find((i) => i.product.id === productId);
    if (!existing) return;

    const nextQty = existing.quantity - 1;

    if (nextQty <= 0) {
      this.remove(productId);
      return;
    }

    existing.quantity = nextQty;
    this._items.set([...items]);
  }

  remove(productId: number) {
    this._items.set(this._items().filter((i) => i.product.id !== productId));
  }

  clear() {
    this._items.set([]);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
