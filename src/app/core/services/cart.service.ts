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
    effect(() => {
      const items = this._items();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // silencioso
      }
    });
  }

  /**
   * ✅ Agora aceita quantidade (default 1)
   * - add(product) -> +1 (compatível com ProductCard atual)
   * - add(product, qty) -> +qty (ProductPage)
   */
  add(product: Product, quantity: number = 1) {
    const qty = this.sanitizeQty(quantity);

    const items = this._items();
    const existing = items.find((i) => i.product.id === product.id);

    if (existing) {
      existing.quantity += qty;
      this._items.set([...items]);
      return;
    }

    this._items.set([...items, { product, quantity: qty }]);
  }

  increase(productId: number, quantity: number = 1) {
    const qty = this.sanitizeQty(quantity);

    const items = this._items();
    const existing = items.find((i) => i.product.id === productId);
    if (!existing) return;

    existing.quantity += qty;
    this._items.set([...items]);
  }

  decrease(productId: number, quantity: number = 1) {
    const qty = this.sanitizeQty(quantity);

    const items = this._items();
    const existing = items.find((i) => i.product.id === productId);
    if (!existing) return;

    const nextQty = existing.quantity - qty;

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

  // ---------- helpers ----------
  private sanitizeQty(value: unknown): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    const i = Math.floor(n);
    return Math.min(99, Math.max(1, i));
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
