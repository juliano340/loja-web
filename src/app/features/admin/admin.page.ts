import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService, ProductPayload, StockMovement } from './admin-api.service';
import { Product } from '../../core/services/products.service';
import { Category } from '../../core/services/categories.service';
import { Order } from '../../core/services/orders.service';

type Tab = 'products' | 'inventory' | 'orders';

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page !items-stretch">
      <div class="w-full max-w-6xl mx-auto px-4 py-6">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <p class="text-sm text-gray-500">Admin</p>
            <h1 class="text-2xl font-semibold text-gray-950">Operação da loja</h1>
          </div>
          <button class="btn-primary sm:w-auto" type="button" (click)="refreshAll()">Atualizar</button>
        </div>

        @if (message) {
        <div class="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {{ message }}
        </div>
        } @if (error) {
        <div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>
        }

        <div class="mb-5 flex flex-wrap gap-2">
          <button class="tab-btn" [class.tab-active]="tab === 'products'" (click)="tab = 'products'">
            Produtos
          </button>
          <button class="tab-btn" [class.tab-active]="tab === 'inventory'" (click)="tab = 'inventory'">
            Estoque
          </button>
          <button class="tab-btn" [class.tab-active]="tab === 'orders'" (click)="tab = 'orders'">
            Pedidos
          </button>
        </div>

        @if (loading) {
        <div class="card">Carregando operação...</div>
        } @else if (tab === 'products') {
        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          <form class="card !p-4 form" (ngSubmit)="saveProduct()">
            <h2 class="text-lg font-semibold text-gray-900">
              @if (editingProductId) { Editar produto } @else { Novo produto }
            </h2>

            <input class="input" name="name" placeholder="Nome" [(ngModel)]="productForm.name" required />
            <input
              class="input"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Preço"
              [(ngModel)]="productForm.price"
              required
            />
            <input
              class="input"
              name="stock"
              type="number"
              min="0"
              step="1"
              placeholder="Estoque"
              [(ngModel)]="productForm.stock"
              required
            />
            <input class="input" name="imageUrl" placeholder="URL da imagem" [(ngModel)]="productForm.imageUrl" />
            <textarea
              class="input min-h-24"
              name="description"
              placeholder="Descrição"
              [(ngModel)]="productForm.description"
            ></textarea>

            <select class="input" name="categoryId" [(ngModel)]="selectedCategoryId" required>
              <option value="">Categoria</option>
              @for (category of categories; track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
              }
            </select>

            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="isActive" [(ngModel)]="productForm.isActive" />
              Produto ativo
            </label>

            <button class="btn-primary" type="submit">
              @if (saving) { Salvando... } @else if (editingProductId) { Salvar alterações } @else { Criar produto }
            </button>
            @if (editingProductId) {
            <button class="btn-secondary" type="button" (click)="resetProductForm()">Cancelar edição</button>
            }
          </form>

          <div class="card overflow-x-auto">
            <div class="flex items-center justify-between gap-3 mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Produtos</h2>
              <span class="text-sm text-gray-500">{{ products.length }} itens</span>
            </div>
            <table class="admin-table">
              <thead>
                <tr><th>Produto</th><th>Preço</th><th>Estoque</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                @for (product of products; track product.id) {
                <tr>
                  <td>
                    <div class="font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-xs text-gray-500">#{{ product.id }}</div>
                  </td>
                  <td>R$ {{ product.price }}</td>
                  <td>
                    <div class="flex items-center gap-0.5">
                      <button class="qty-btn" type="button" (click)="quickAdjustStock(product.id, -1)" title="-1">−</button>
                      <span class="w-6 text-center tabular-nums text-xs">{{ product.stock }}</span>
                      <button class="qty-btn" type="button" (click)="quickAdjustStock(product.id, +1)" title="+1">+</button>
                      <button class="qty-btn qty-btn-sm" type="button" (click)="quickAdjustStock(product.id, +5)" title="+5">+5</button>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [class.badge-off]="!product.isActive">
                      {{ product.isActive ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="text-right whitespace-nowrap">
                    <button class="link-btn" type="button" (click)="editProduct(product)">Editar</button>
                  </td>
                </tr>
                } @empty {
                <tr><td colspan="5" class="text-center text-gray-500 py-6">Nenhum produto cadastrado.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        } @else if (tab === 'inventory') {
        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          <div class="card !p-4 form">
            <h2 class="text-lg font-semibold text-gray-900">Ajustar estoque</h2>
            <select class="input" [(ngModel)]="inventoryProductId" name="inventoryProductId" (change)="loadMovements()">
              <option [ngValue]="null">Selecione produto</option>
              @for (product of products; track product.id) {
              <option [ngValue]="product.id">{{ product.name }} ({{ product.stock }})</option>
              }
            </select>
            <input class="input" type="number" step="1" name="stockDelta" placeholder="Delta: +10 ou -2" [(ngModel)]="stockDelta" />
            <input class="input" name="stockNote" placeholder="Observação" [(ngModel)]="stockNote" />
            <button class="btn-primary" type="button" [disabled]="!inventoryProductId || !stockDelta" (click)="adjustStock()">
              Aplicar ajuste
            </button>
          </div>

          <div class="card overflow-x-auto">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Movimentações</h2>
            <table class="admin-table">
              <thead>
                <tr><th>Data</th><th>Tipo</th><th>Origem</th><th>Qtd</th><th>Antes</th><th>Depois</th><th>Nota</th></tr>
              </thead>
              <tbody>
                @for (movement of movements; track movement.id) {
                <tr>
                  <td>{{ movement.createdAt | date:'short' }}</td>
                  <td>{{ movement.type }}</td>
                  <td>{{ movement.source }}</td>
                  <td>{{ movement.quantity }}</td>
                  <td>{{ movement.previousQuantity }}</td>
                  <td>{{ movement.newQuantity }}</td>
                  <td>{{ movement.note || '-' }}</td>
                </tr>
                } @empty {
                <tr><td colspan="7" class="text-center text-gray-500 py-6">Selecione um produto.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        } @else {
        <div class="card overflow-x-auto">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Pedidos</h2>
            <button class="btn-secondary sm:w-auto" type="button" (click)="cancelExpired()">Cancelar pendentes expirados</button>
          </div>

          <div class="flex flex-wrap gap-2 mb-3">
            <button class="tab-btn" [class.tab-active]="orderFilter === 'ALL'" (click)="orderFilter = 'ALL'; orderPage = 1">Todos</button>
            <button class="tab-btn" [class.tab-active]="orderFilter === 'PENDING'" (click)="orderFilter = 'PENDING'; orderPage = 1">Pendentes</button>
            <button class="tab-btn" [class.tab-active]="orderFilter === 'PAID'" (click)="orderFilter = 'PAID'; orderPage = 1">Pagos</button>
            <button class="tab-btn" [class.tab-active]="orderFilter === 'CANCELLED'" (click)="orderFilter = 'CANCELLED'; orderPage = 1">Cancelados</button>
          </div>

          <table class="admin-table">
            <thead>
              <tr><th>Pedido</th><th>Status</th><th>Total</th><th>Cliente</th><th>Data</th><th>Ação</th></tr>
            </thead>
            <tbody>
              @for (order of paginatedOrders; track order.id) {
              <tr>
                <td>
                  <button class="link-btn font-mono" type="button" (click)="toggleOrderDetail(order)">
                    #{{ order.id }}
                  </button>
                </td>
                <td><span class="badge">{{ order.status }}</span></td>
                <td>R$ {{ order.total }}</td>
                <td>{{ order.user?.name ?? '#' + order.userId }}</td>
                <td>{{ order.createdAt | date:'short' }}</td>
                <td>
                  <select class="input !py-1" [ngModel]="order.status" (ngModelChange)="updateOrder(order, $event)">
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
              @if (selectedOrderId === order.id) {
              <tr>
                <td colspan="6" class="!bg-gray-50 !px-6 !py-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 class="text-sm font-semibold text-gray-700 mb-2">Itens</h3>
                      <table class="admin-table text-xs">
                        <thead><tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Total</th></tr></thead>
                        <tbody>
                          @for (item of order.items; track item.id) {
                          <tr>
                            <td>{{ item.productName }}</td>
                            <td>{{ item.quantity }}</td>
                            <td>R$ {{ item.unitPrice }}</td>
                            <td>R$ {{ itemTotal(item) }}</td>
                          </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                    <div class="space-y-1 text-sm">
                      <h3 class="text-sm font-semibold text-gray-700 mb-2">Detalhes</h3>
                      <p><span class="text-gray-500">Cliente:</span> {{ order.user?.name ?? '#' + order.userId }}</p>
                      <p><span class="text-gray-500">Email:</span> {{ order.user?.email ?? '-' }}</p>
                      <p><span class="text-gray-500">Criado:</span> {{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                      @if (order.paidAt) { <p><span class="text-gray-500">Pago:</span> {{ order.paidAt | date:'dd/MM/yyyy HH:mm' }}</p> }
                      @if (order.cancelledAt) { <p><span class="text-gray-500">Cancelado:</span> {{ order.cancelledAt | date:'dd/MM/yyyy HH:mm' }}</p> }
                      @if (order.couponCode) {
                      <p><span class="text-gray-500">Cupom:</span> {{ order.couponCode }} ({{ order.discountType }} {{ order.discountValue }})</p>
                      }
                      @if (order.shippingAddress) {
                      <p><span class="text-gray-500">Endereço:</span> {{ order.shippingAddress.street }}, {{ order.shippingAddress.number }} - {{ order.shippingAddress.city }}/{{ order.shippingAddress.state }}</p>
                      }
                    </div>
                  </div>
                </td>
              </tr>
              }
              } @empty {
              <tr><td colspan="6" class="text-center text-gray-500 py-6">Nenhum pedido encontrado.</td></tr>
              }
            </tbody>
          </table>

          @if (totalOrderPages > 1) {
          <div class="flex items-center justify-between mt-4 text-sm text-gray-600">
            <button class="link-btn" type="button" [disabled]="orderPage <= 1" (click)="orderPage = orderPage - 1">← Anterior</button>
            <span>Página {{ orderPage }} de {{ totalOrderPages }}</span>
            <button class="link-btn" type="button" [disabled]="orderPage >= totalOrderPages" (click)="orderPage = orderPage + 1">Próximo →</button>
          </div>
          }
        </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .tab-btn { border: 1px solid #d1d5db; border-radius: 999px; padding: 0.5rem 1rem; background: white; color: #374151; }
      .tab-active { background: #111827; color: white; border-color: #111827; }
      .btn-secondary { width: 100%; border-radius: 0.375rem; border: 1px solid #d1d5db; background: white; padding: 0.5rem 1rem; color: #111827; transition: background .15s; }
      .btn-secondary:hover { background: #f9fafb; }
      .admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
      .admin-table th { text-align: left; color: #6b7280; font-weight: 500; padding: 0.5rem 0.6rem; border-bottom: 1px solid #e5e7eb; }
      .admin-table td { padding: 0.5rem 0.6rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
      .badge { display: inline-flex; border-radius: 999px; padding: 0.125rem 0.625rem; background: #ecfdf5; color: #047857; font-size: 0.75rem; font-weight: 600; }
      .badge-off { background: #f3f4f6; color: #6b7280; }
      .link-btn { color: #2563eb; font-weight: 500; background: none; border: none; cursor: pointer; padding: 0; font-size: inherit; }
      .link-btn:hover { text-decoration: underline; }
      .link-btn[disabled] { color: #9ca3af; pointer-events: none; }
      .qty-btn { width: 20px; height: 20px; border-radius: 3px; border: 1px solid #d1d5db; background: #f9fafb; color: #374151; font-size: 0.688rem; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; line-height: 1; }
      .qty-btn-sm { font-size: 0.625rem; width: 22px; }
      .qty-btn:hover { background: #e5e7eb; }
    `,
  ],
})
export class AdminPage implements OnInit {
  tab: Tab = 'products';
  loading = true;
  saving = false;
  error = '';
  message = '';

  products: Product[] = [];
  categories: Category[] = [];
  orders: Order[] = [];
  movements: StockMovement[] = [];

  editingProductId: number | null = null;
  selectedCategoryId = '';
  productForm: ProductPayload = this.emptyProductForm();

  inventoryProductId: number | null = null;
  stockDelta = 0;
  stockNote = '';

  selectedOrderId: number | null = null;
  orderFilter = 'ALL';
  orderPage = 1;
  ordersPerPage = 10;

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.refreshAll();
  }

  get filteredOrders() {
    if (this.orderFilter === 'ALL') return this.orders;
    return this.orders.filter(o => o.status === this.orderFilter);
  }

  get paginatedOrders() {
    const start = (this.orderPage - 1) * this.ordersPerPage;
    return this.filteredOrders.slice(start, start + this.ordersPerPage);
  }

  get totalOrderPages() {
    return Math.ceil(this.filteredOrders.length / this.ordersPerPage) || 1;
  }

  refreshAll() {
    this.loading = true;
    this.error = '';
    let remaining = 3;
    const done = () => {
      remaining--;
      if (remaining === 0) this.loading = false;
    };

    this.api.listProducts().subscribe({ next: (v) => (this.products = v), error: (e) => this.setError(e), complete: done });
    this.api.listCategories().subscribe({ next: (v) => (this.categories = v), error: (e) => this.setError(e), complete: done });
    this.api.listOrders().subscribe({ next: (v) => (this.orders = v), error: (e) => this.setError(e), complete: done });
  }

  saveProduct() {
    if (!this.selectedCategoryId) return;
    this.saving = true;
    this.error = '';
    this.message = '';
    const payload = { ...this.productForm, categoryIds: [this.selectedCategoryId] };
    const request = this.editingProductId
      ? this.api.updateProduct(this.editingProductId, payload)
      : this.api.createProduct(payload);

    request.subscribe({
      next: () => {
        this.message = this.editingProductId ? 'Produto atualizado.' : 'Produto criado.';
        this.resetProductForm();
        this.refreshAll();
      },
      error: (e) => this.setError(e),
      complete: () => (this.saving = false),
    });
  }

  editProduct(product: Product) {
    this.editingProductId = product.id;
    this.selectedCategoryId = product.categories?.[0]?.id ?? '';
    this.productForm = {
      name: product.name,
      description: product.description ?? '',
      price: Number(product.price),
      stock: Number(product.stock),
      imageUrl: product.imageUrl ?? '',
      isActive: product.isActive,
      categoryIds: product.categories?.map((c) => c.id) ?? [],
    };
  }

  resetProductForm() {
    this.editingProductId = null;
    this.selectedCategoryId = '';
    this.productForm = this.emptyProductForm();
  }

  adjustStock() {
    if (!this.inventoryProductId || !this.stockDelta) return;
    this.api.adjustStock(this.inventoryProductId, Number(this.stockDelta), this.stockNote).subscribe({
      next: () => {
        this.message = 'Estoque ajustado.';
        this.stockDelta = 0;
        this.stockNote = '';
        this.loadMovements();
        this.api.listProducts().subscribe((products) => (this.products = products));
      },
      error: (e) => this.setError(e),
    });
  }

  loadMovements() {
    this.movements = [];
    if (!this.inventoryProductId) return;
    this.api.getMovements(this.inventoryProductId).subscribe({
      next: (v) => (this.movements = v),
      error: (e) => this.setError(e),
    });
  }

  updateOrder(order: Order, status: string) {
    if (order.status === status) return;
    this.api.updateOrderStatus(order.id, status).subscribe({
      next: (updated) => {
        order.status = updated.status;
        this.message = `Pedido #${order.id} atualizado.`;
      },
      error: (e) => this.setError(e),
    });
  }

  cancelExpired() {
    this.api.cancelExpiredOrders().subscribe({
      next: (count) => {
        this.message = `${count} pedidos expirados cancelados.`;
        this.api.listOrders().subscribe((orders) => (this.orders = orders));
      },
      error: (e) => this.setError(e),
    });
  }

  itemTotal(item: { quantity: number; unitPrice: string }) {
    return (item.quantity * Number(item.unitPrice)).toFixed(2);
  }

  toggleOrderDetail(order: Order) {
    this.selectedOrderId = this.selectedOrderId === order.id ? null : order.id;
  }

  quickAdjustStock(productId: number, delta: number) {
    this.api.adjustStock(productId, delta, 'Ajuste rápido').subscribe({
      next: () => {
        this.message = `Estoque #${productId} ajustado em ${delta > 0 ? '+' : ''}${delta}.`;
        this.api.listProducts().subscribe(products => this.products = products);
        if (this.inventoryProductId === productId) this.loadMovements();
      },
      error: (e) => this.setError(e),
    });
  }

  private emptyProductForm(): ProductPayload {
    return { name: '', description: '', price: 0, stock: 0, imageUrl: '', isActive: true, categoryIds: [] };
  }

  private setError(err: any) {
    const message = err?.error?.message;
    this.error = Array.isArray(message) ? message.join(', ') : message || 'Erro na operação.';
    this.loading = false;
    this.saving = false;
  }
}
