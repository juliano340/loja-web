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
      <div class="w-full max-w-7xl mx-auto px-4 py-6">
        @if (message) {
        <div class="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {{ message }}
        </div>
        } @if (error) {
        <div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error }}
        </div>
        }

        <div class="flex gap-6">
          <!-- SIDEBAR -->
          <aside class="w-52 flex-shrink-0">
            <nav class="sticky top-6 space-y-1">
              <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</p>

              <button class="sidebar-link" [class.sidebar-active]="tab === 'products'" (click)="tab = 'products'">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                Produtos
              </button>

              <button class="sidebar-link" [class.sidebar-active]="tab === 'inventory'" (click)="tab = 'inventory'">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2a2 2 0 0 0 1 1.73"/><path d="M21 16v2a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 18v-2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Estoque
              </button>

              <button class="sidebar-link" [class.sidebar-active]="tab === 'orders'" (click)="tab = 'orders'">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Pedidos
              </button>
            </nav>
          </aside>

          <!-- MAIN CONTENT -->
          <main class="flex-1 min-w-0">
            @if (loading) {
            <div class="card">Carregando...</div>
            } @else if (tab === 'products') {
            <div class="mb-6">
              <h1 class="text-2xl font-semibold text-gray-950">Produtos</h1>
              <p class="text-sm text-gray-500 mt-1">Gerencie o catálogo de produtos da loja.</p>
            </div>
            <div class="card !max-w-none overflow-x-auto">
              <div class="flex items-center justify-between gap-3 mb-4">
                <span class="text-sm text-gray-500">{{ products.length }} itens</span>
                <button class="btn-primary sm:w-auto" type="button" (click)="openCreateProduct()">Novo produto</button>
              </div>
              <table class="admin-table">
                <thead>
                  <tr><th>Produto</th><th>SKU</th><th>Preço</th><th>Estoque</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  @for (product of products; track product.id) {
                  <tr>
                    <td>
                      <div class="font-medium text-gray-900 truncate" [title]="product.name">{{ product.name }}</div>
                      <div class="text-xs text-gray-500">#{{ product.id }}</div>
                    </td>
                    <td class="text-xs font-mono text-gray-500">{{ product.sku || '—' }}</td>
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
                  <tr><td colspan="6" class="text-center text-gray-500 py-6">Nenhum produto cadastrado.</td></tr>
                  }
                </tbody>
              </table>
            </div>

            @if (showProductModal) {
            <div class="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-10 pb-10 overflow-y-auto" role="dialog" aria-modal="true">
              <div class="absolute inset-0 bg-black/40" (click)="closeProductModal()"></div>
              <div class="relative w-full max-w-lg rounded-xl bg-white border border-gray-200 shadow-xl p-6">
                <div class="flex items-center justify-between mb-5">
                  <h2 class="text-lg font-semibold text-gray-900">
                    @if (editingProductId) { Editar produto } @else { Novo produto }
                  </h2>
                  <button type="button" class="text-gray-500 hover:text-gray-700 transition" (click)="closeProductModal()" aria-label="Fechar"></button>
                </div>

                <form class="form" (ngSubmit)="saveProduct()">
                  <label class="text-xs font-medium text-gray-500">Nome</label>
                  <input class="input" name="name" [(ngModel)]="productForm.name" required />

                  <label class="text-xs font-medium text-gray-500">SKU</label>
                  <input class="input" name="sku" [(ngModel)]="productForm.sku" />

                  <label class="text-xs font-medium text-gray-500">Preço</label>
                  <input class="input" name="price" type="number" min="0" step="0.01" [(ngModel)]="productForm.price" required />

                  <label class="text-xs font-medium text-gray-500">Estoque</label>
                  <input class="input" name="stock" type="number" min="0" step="1" [(ngModel)]="productForm.stock" required />

                  <label class="text-xs font-medium text-gray-500">URL da imagem</label>
                  <input class="input" name="imageUrl" [(ngModel)]="productForm.imageUrl" />

                  <label class="text-xs font-medium text-gray-500">Descrição</label>
                  <textarea class="input min-h-24" name="description" [(ngModel)]="productForm.description"></textarea>

                  <label class="text-xs font-medium text-gray-500">Categoria</label>
                  <select class="input" name="categoryId" [(ngModel)]="selectedCategoryId" required>
                    <option value="">Selecione</option>
                    @for (category of categories; track category.id) {
                    <option [value]="category.id">{{ category.name }}</option>
                    }
                  </select>

                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" name="isActive" [(ngModel)]="productForm.isActive" />
                    Produto ativo
                  </label>

                  <div class="flex items-center gap-3 pt-2">
                    <button class="btn-primary" type="submit">
                      @if (saving) { Salvando... } @else if (editingProductId) { Salvar alterações } @else { Criar produto }
                    </button>
                    <button class="btn-secondary sm:w-auto" type="button" (click)="closeProductModal()">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
            }
            } @else if (tab === 'inventory') {
            <div class="mb-6">
              <h1 class="text-2xl font-semibold text-gray-950">Estoque</h1>
              <p class="text-sm text-gray-500 mt-1">Registre entradas, saídas e ajustes de saldo.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
              <div class="card !p-4 form">
                <h2 class="text-lg font-semibold text-gray-900">Lançamento</h2>

                <label class="text-xs font-medium text-gray-500">Buscar produto (nome ou SKU)</label>
                <input class="input" name="inventorySearch" placeholder="Digite para filtrar..." [(ngModel)]="inventorySearch" (ngModelChange)="onInventorySearchChange()" />

                @if (inventorySearch) {
                <div class="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  @for (product of filteredInventoryProducts; track product.id) {
                  <button type="button" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0" [class.bg-blue-50]="inventoryProductId === product.id" (click)="selectInventoryProduct(product)">
                    <span class="font-medium">{{ product.name }}</span>
                    @if (product.sku) { <span class="text-xs text-gray-400 ml-1">({{ product.sku }})</span> }
                    <span class="text-xs text-gray-500 float-right">{{ product.stock }} un.</span>
                  </button>
                  } @empty {
                  <div class="px-3 py-2 text-sm text-gray-400">Nenhum produto encontrado.</div>
                  }
                </div>
                } @else if (inventoryProductId) {
                <div class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md text-sm">
                  <div>
                    <span class="font-medium">{{ selectedProduct?.name }}</span>
                    @if (selectedProduct?.sku) { <span class="text-xs text-gray-400 ml-1">({{ selectedProduct?.sku }})</span> }
                  </div>
                  <button type="button" class="text-gray-400 hover:text-gray-600" (click)="clearInventorySelection()">✕</button>
                </div>
                }

                <label class="text-xs font-medium text-gray-500">Tipo</label>
                <div class="flex gap-2">
                  <button type="button" class="stock-type-btn" [class.stock-type-active]="stockType === 'entry'" (click)="stockType = 'entry'">Entrada</button>
                  <button type="button" class="stock-type-btn" [class.stock-type-active]="stockType === 'exit'" (click)="stockType = 'exit'">Saída</button>
                  <button type="button" class="stock-type-btn" [class.stock-type-active]="stockType === 'adjust'" (click)="stockType = 'adjust'">Ajuste</button>
                </div>

                <label class="text-xs font-medium text-gray-500">Origem</label>
                <select class="input" [(ngModel)]="stockOrigin" name="stockOrigin">
                  @if (stockType === 'entry') {
                  <option value="purchase">Compra</option>
                  <option value="return">Devolução</option>
                  <option value="inventory">Inventário</option>
                  <option value="other">Outro</option>
                  } @else if (stockType === 'exit') {
                  <option value="sale">Venda</option>
                  <option value="loss">Perda</option>
                  <option value="return">Devolução</option>
                  <option value="other">Outro</option>
                  } @else {
                  <option value="inventory">Inventário</option>
                  <option value="other">Outro</option>
                  }
                </select>

                <label class="text-xs font-medium text-gray-500">Quantidade</label>
                <input class="input" type="number" min="1" step="1" name="stockQuantity" placeholder="0" [(ngModel)]="stockQuantity" />

                <label class="text-xs font-medium text-gray-500">Observação</label>
                <input class="input" name="stockNote" placeholder="Opcional" [(ngModel)]="stockNote" />

                <button class="btn-primary" type="button" [disabled]="!inventoryProductId || !stockQuantity" (click)="adjustStock()">
                  Registrar
                </button>
              </div>

              <div class="card !max-w-none overflow-x-auto">
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
            <div class="mb-6">
              <h1 class="text-2xl font-semibold text-gray-950">Pedidos</h1>
              <p class="text-sm text-gray-500 mt-1">Gerencie pedidos e acompanhe pagamentos.</p>
            </div>
            <div class="card !max-w-none overflow-x-auto">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <button class="btn-secondary sm:w-auto" style="width:auto" type="button" (click)="cancelExpired()">Cancelar pendentes expirados</button>
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
          </main>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .sidebar-link { display: flex; align-items: center; gap: 0.625rem; width: 100%; padding: 0.625rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #4b5563; background: transparent; border: none; cursor: pointer; text-align: left; transition: all .15s; }
      .sidebar-link:hover { background: #f3f4f6; color: #111827; }
      .sidebar-active { background: #111827; color: white; }
      .sidebar-active:hover { background: #111827; color: white; }
      .tab-btn { border: 1px solid #d1d5db; border-radius: 999px; padding: 0.5rem 1rem; background: white; color: #374151; }
      .tab-active { background: #111827; color: white; border-color: #111827; }
      .stock-type-btn { flex: 1; padding: 0.5rem; border-radius: 0.375rem; border: 1px solid #d1d5db; background: white; color: #374151; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all .15s; }
      .stock-type-btn:hover { background: #f3f4f6; }
      .stock-type-active { background: #111827; color: white; border-color: #111827; }
      .btn-secondary { width: 100%; border-radius: 0.375rem; border: 1px solid #d1d5db; background: white; padding: 0.5rem 1rem; color: #111827; transition: background .15s; }
      .btn-secondary:hover { background: #f9fafb; }
      .admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
      .admin-table th { text-align: left; color: #6b7280; font-weight: 500; padding: 0.6rem 0.75rem; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
      .admin-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
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
  inventorySearch = '';
  stockQuantity = 0;
  stockNote = '';
  stockType: 'entry' | 'exit' | 'adjust' = 'entry';
  stockOrigin = 'purchase';

  selectedOrderId: number | null = null;
  orderFilter = 'ALL';
  orderPage = 1;
  ordersPerPage = 10;
  showProductModal = false;

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

  get filteredInventoryProducts() {
    if (!this.inventorySearch) return this.products;
    const q = this.inventorySearch.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
    );
  }

  get selectedProduct() {
    return this.products.find(p => p.id === this.inventoryProductId) || null;
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
      sku: product.sku ?? '',
      description: product.description ?? '',
      price: Number(product.price),
      stock: Number(product.stock),
      imageUrl: product.imageUrl ?? '',
      isActive: product.isActive,
      categoryIds: product.categories?.map((c) => c.id) ?? [],
    };
    this.showProductModal = true;
  }

  openCreateProduct() {
    this.resetProductForm();
    this.showProductModal = true;
  }

  closeProductModal() {
    this.showProductModal = false;
    this.resetProductForm();
  }

  resetProductForm() {
    this.editingProductId = null;
    this.selectedCategoryId = '';
    this.productForm = this.emptyProductForm();
  }

  adjustStock() {
    if (!this.inventoryProductId || !this.stockQuantity) return;
    const delta = this.stockType === 'exit' ? -this.stockQuantity : this.stockQuantity;
    const originMap: Record<string, string> = {
      purchase: 'Compra',
      return: 'Devolução',
      loss: 'Perda',
      inventory: 'Inventário',
      sale: 'Venda',
      other: 'Outro',
    };
    const note = this.stockNote
      ? `[${originMap[this.stockOrigin] || this.stockOrigin}] ${this.stockNote}`
      : originMap[this.stockOrigin] || this.stockOrigin;
    this.api.adjustStock(this.inventoryProductId, delta, note).subscribe({
      next: () => {
        this.message = 'Estoque ajustado.';
        this.stockQuantity = 0;
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
    return { name: '', sku: '', description: '', price: 0, stock: 0, imageUrl: '', isActive: true, categoryIds: [] };
  }

  onInventorySearchChange() {
    if (!this.inventorySearch) {
      this.inventoryProductId = null;
    }
  }

  selectInventoryProduct(product: Product) {
    this.inventoryProductId = product.id;
    this.inventorySearch = '';
    this.loadMovements();
  }

  clearInventorySelection() {
    this.inventoryProductId = null;
    this.movements = [];
  }

  private setError(err: any) {
    const message = err?.error?.message;
    this.error = Array.isArray(message) ? message.join(', ') : message || 'Erro na operação.';
    this.loading = false;
    this.saving = false;
  }
}
