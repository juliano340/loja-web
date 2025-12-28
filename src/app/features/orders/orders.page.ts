import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OrdersService, Order, OrderItem } from '../../core/services/orders.service';

type PriceLike = string | number | null | undefined;
type OrderStatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'CANCELLED';
type OrderSort = 'NEWEST' | 'OLDEST' | 'TOTAL_DESC' | 'TOTAL_ASC';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  template: `
    <!-- ✅ Altura fixa e sem scroll na janela -->
    <section
      class="h-[calc(100vh-56px)] overflow-hidden flex items-start justify-center px-4 sm:px-6"
    >
      <div class="w-full max-w-5xl h-full flex flex-col py-8 gap-5">
        <!-- Header -->
        <header class="flex items-start justify-between gap-4 shrink-0">
          <div class="min-w-0">
            <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">Meus pedidos</h1>
            <p class="text-sm text-gray-500 mt-1">
              Acompanhe seus pedidos e veja os detalhes de cada compra.
            </p>
          </div>

          <button
            type="button"
            class="hidden sm:inline-flex px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition shrink-0"
            (click)="goToProducts()"
          >
            Ver produtos
          </button>
        </header>

        <!-- Body (scroll interno controlado) -->
        <div class="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
          @if (loading) {
          <div class="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            @for (i of skeletons; track i) {
            <div class="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-2 w-full">
                  <div class="h-4 bg-gray-200 rounded w-44"></div>
                  <div class="h-3 bg-gray-200 rounded w-72"></div>
                  <div class="h-3 bg-gray-200 rounded w-56"></div>
                </div>
                <div class="h-8 bg-gray-200 rounded w-28"></div>
              </div>
              <div class="mt-4 space-y-2">
                <div class="h-3 bg-gray-200 rounded w-full"></div>
                <div class="h-3 bg-gray-200 rounded w-5/6"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            }
          </div>
          } @else if (error) {
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-start gap-4">
              <div
                class="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center"
              >
                <span class="text-lg">⚠️</span>
              </div>

              <div class="flex-1">
                <h2 class="text-lg font-semibold text-gray-900">
                  Não foi possível carregar seus pedidos
                </h2>
                <p class="text-sm text-gray-600 mt-1">Verifique sua conexão e tente novamente.</p>

                <div class="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    class="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    (click)="reload()"
                  >
                    Tentar novamente
                  </button>

                  <button
                    type="button"
                    class="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
                    (click)="goToProducts()"
                  >
                    Ver produtos
                  </button>
                </div>
              </div>
            </div>
          </div>
          } @else if (allOrders.length === 0) {
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-start gap-4">
              <div
                class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl"
              >
                📦
              </div>

              <div class="flex-1">
                <h2 class="text-lg font-semibold text-gray-900">Você ainda não fez pedidos</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Quando você finalizar uma compra, seus pedidos vão aparecer aqui.
                </p>

                <div class="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    class="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    (click)="goToProducts()"
                  >
                    Explorar produtos
                  </button>

                  <button
                    type="button"
                    class="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
                    (click)="goHome()"
                  >
                    Voltar para o início
                  </button>
                </div>
              </div>
            </div>
          </div>
          } @else {
          <!-- Controls -->
          <div class="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shrink-0">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div class="text-sm text-gray-700">
                <span class="font-semibold text-gray-900">{{ allOrders.length }}</span>
                pedido(s) no total @if (visibleOrders.length !== allOrders.length) {
                <span class="text-gray-500"> • mostrando {{ visibleOrders.length }}</span>
                } @if (isDesktopPaginationEnabled()) {
                <span class="text-gray-500"> • página {{ currentPage }} de {{ totalPages }}</span>
                }
              </div>

              <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                <!-- Filter -->
                <div
                  class="inline-flex w-full sm:w-auto rounded-md border border-gray-200 bg-gray-50 p-1"
                  role="tablist"
                  aria-label="Filtrar pedidos por status"
                >
                  <button
                    type="button"
                    class="px-3 py-2 text-sm font-medium rounded-md transition w-full sm:w-auto"
                    [class]="filterBtnClass('ALL')"
                    (click)="setStatusFilter('ALL')"
                    role="tab"
                    [attr.aria-selected]="statusFilter === 'ALL'"
                  >
                    Todos
                    <span class="ml-2 text-xs font-semibold text-gray-600">({{ counts.all }})</span>
                  </button>

                  <button
                    type="button"
                    class="px-3 py-2 text-sm font-medium rounded-md transition w-full sm:w-auto"
                    [class]="filterBtnClass('PENDING')"
                    (click)="setStatusFilter('PENDING')"
                    role="tab"
                    [attr.aria-selected]="statusFilter === 'PENDING'"
                  >
                    Pendente
                    <span class="ml-2 text-xs font-semibold text-gray-600"
                      >({{ counts.pending }})</span
                    >
                  </button>

                  <button
                    type="button"
                    class="px-3 py-2 text-sm font-medium rounded-md transition w-full sm:w-auto"
                    [class]="filterBtnClass('PAID')"
                    (click)="setStatusFilter('PAID')"
                    role="tab"
                    [attr.aria-selected]="statusFilter === 'PAID'"
                  >
                    Pago
                    <span class="ml-2 text-xs font-semibold text-gray-600"
                      >({{ counts.paid }})</span
                    >
                  </button>

                  <button
                    type="button"
                    class="px-3 py-2 text-sm font-medium rounded-md transition w-full sm:w-auto"
                    [class]="filterBtnClass('CANCELLED')"
                    (click)="setStatusFilter('CANCELLED')"
                    role="tab"
                    [attr.aria-selected]="statusFilter === 'CANCELLED'"
                  >
                    Cancelado
                    <span class="ml-2 text-xs font-semibold text-gray-600"
                      >({{ counts.cancelled }})</span
                    >
                  </button>
                </div>

                <!-- Sort -->
                <div class="w-full sm:w-auto">
                  <label class="sr-only" for="ordersSort">Ordenar pedidos</label>
                  <select
                    id="ordersSort"
                    class="w-full sm:w-56 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-600"
                    [value]="sort"
                    (change)="setSort($any($event.target).value)"
                    aria-label="Ordenar pedidos"
                  >
                    <option value="NEWEST">Mais recentes</option>
                    <option value="OLDEST">Mais antigos</option>
                    <option value="TOTAL_DESC">Maior total</option>
                    <option value="TOTAL_ASC">Menor total</option>
                  </select>
                </div>

                <!-- ✅ Page size: só aparece no desktop (sm+) -->
                <div class="hidden sm:block w-full sm:w-auto">
                  <label class="sr-only" for="ordersPageSize">Itens por página</label>
                  <select
                    id="ordersPageSize"
                    class="w-full sm:w-40 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-600"
                    [value]="pageSizeValue"
                    (change)="setPageSize($any($event.target).value)"
                    aria-label="Itens por página"
                  >
                    <option value="5">5 / página</option>
                    <option value="8">8 / página</option>
                    <option value="12">12 / página</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty (filtered) -->
          @if (visibleOrders.length === 0) {
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-start gap-4">
              <div
                class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl"
              >
                🔎
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-semibold text-gray-900">Nenhum pedido encontrado</h2>
                <p class="text-sm text-gray-600 mt-1">
                  Não há pedidos com o status
                  <span class="font-semibold text-gray-800">{{ statusLabel(statusFilter) }}</span
                  >.
                </p>

                <div class="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    class="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
                    (click)="setStatusFilter('ALL')"
                  >
                    Ver todos
                  </button>

                  <button
                    type="button"
                    class="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    (click)="goToProducts()"
                  >
                    Ver produtos
                  </button>
                </div>
              </div>
            </div>
          </div>
          } @else {
          <!-- ✅ Lista rola internamente -->
          <div class="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            @for (order of pagedOrders; track order.id) {
            <article class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                class="w-full text-left p-5 hover:bg-gray-50 transition"
                (click)="toggle(order.id)"
                [attr.aria-expanded]="isExpanded(order.id)"
                [attr.aria-controls]="'order-panel-' + order.id"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <div class="flex items-center gap-3 flex-wrap">
                      <p class="text-sm font-semibold text-gray-900">Pedido #{{ order.id }}</p>

                      <span
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border"
                        [class]="statusBadgeClass(order.status)"
                      >
                        {{ statusLabel(order.status) }}
                      </span>
                    </div>

                    <p class="text-xs text-gray-500 mt-1">
                      Criado em {{ formatDate(order.createdAt) }}
                    </p>

                    <p class="text-xs text-gray-600 mt-2">
                      {{ order.items.length }} item(ns) • Subtotal
                      {{ formatMoney(order.subtotal) }} • Frete
                      {{ formatMoney(order.shippingFee) }}
                      @if (hasDiscount(order)) { • Desconto {{ formatMoney(order.discountAmount) }}
                      }
                    </p>
                  </div>

                  <div class="shrink-0 text-right">
                    <p class="text-xs text-gray-500">Total</p>
                    <p class="text-lg font-bold text-gray-900">{{ formatMoney(order.total) }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      @if (isExpanded(order.id)) { Ocultar } @else { Ver detalhes } ▾
                    </p>
                  </div>
                </div>
              </button>

              @if (isExpanded(order.id)) {
              <div class="border-t border-gray-200 p-5 bg-white" [id]="'order-panel-' + order.id">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <section class="lg:col-span-2">
                    <h3 class="text-sm font-semibold text-gray-900">Itens</h3>

                    <div
                      class="mt-3 divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden"
                    >
                      @for (item of order.items; track item.id) {
                      <div class="p-4 flex items-start justify-between gap-4">
                        <div class="min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">
                            {{ item.productName }}
                          </p>
                          <p class="text-xs text-gray-600 mt-1">
                            {{ item.quantity }}x • Unitário {{ formatMoney(item.unitPrice) }}
                          </p>
                        </div>

                        <div class="shrink-0 text-sm font-semibold text-gray-900">
                          {{ formatMoney(lineTotal(item)) }}
                        </div>
                      </div>
                      }
                    </div>
                  </section>

                  <aside class="lg:col-span-1">
                    <h3 class="text-sm font-semibold text-gray-900">Entrega</h3>
                    <div class="mt-3 border border-gray-200 rounded-lg p-4 text-sm">
                      <p class="text-gray-900 font-medium">
                        {{ order.shippingAddress.street }}, {{ order.shippingAddress.number }}
                      </p>
                      <p class="text-gray-600 mt-1">
                        {{ order.shippingAddress.city }}/{{ order.shippingAddress.state }}
                      </p>
                      <p class="text-gray-600 mt-1">CEP: {{ order.shippingAddress.zip }}</p>

                      @if (order.shippingAddress.complement) {
                      <p class="text-gray-600 mt-1">
                        Complemento: {{ order.shippingAddress.complement }}
                      </p>
                      }
                    </div>
                  </aside>
                </div>
              </div>
              }
            </article>
            }
          </div>

          <!-- ✅ Paginação: só no desktop -->
          @if (isDesktopPaginationEnabled()) {
          <div
            class="bg-white border border-gray-200 rounded-lg p-4 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div class="text-sm text-gray-700">
              Mostrando
              <span class="font-semibold text-gray-900">{{ pageStart }}</span>
              –
              <span class="font-semibold text-gray-900">{{ pageEnd }}</span>
              de
              <span class="font-semibold text-gray-900">{{ visibleOrders.length }}</span>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-2">
              <button
                type="button"
                class="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                (click)="prevPage()"
                [disabled]="currentPage === 1"
                aria-label="Página anterior"
              >
                ← Anterior
              </button>

              <span class="text-sm text-gray-600 px-2">
                Página <span class="font-semibold text-gray-900">{{ currentPage }}</span> de
                <span class="font-semibold text-gray-900">{{ totalPages }}</span>
              </span>

              <button
                type="button"
                class="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                (click)="nextPage()"
                [disabled]="currentPage >= totalPages"
                aria-label="Próxima página"
              >
                Próxima →
              </button>
            </div>
          </div>
          }

          <!-- Mobile CTA -->
          <div class="sm:hidden shrink-0">
            <button
              type="button"
              class="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
              (click)="goToProducts()"
            >
              Ver produtos
            </button>
          </div>
          } }
        </div>
      </div>
    </section>
  `,
})
export class OrdersPage implements OnInit, OnDestroy {
  loading = true;
  error = false;

  allOrders: Order[] = [];
  visibleOrders: Order[] = [];
  pagedOrders: Order[] = [];

  statusFilter: OrderStatusFilter = 'ALL';
  sort: OrderSort = 'NEWEST';

  pageSize = 8;
  currentPage = 1;
  totalPages = 1;

  counts = { all: 0, pending: 0, paid: 0, cancelled: 0 };

  private expandedIds = new Set<number>();
  skeletons = [1, 2, 3];

  // ✅ controla se estamos em desktop (>= sm)
  private desktopMedia = window.matchMedia('(min-width: 640px)');
  private onMediaChange = () => {
    // ao mudar o breakpoint, recalcula a lista exibida
    this.currentPage = 1;
    this.expandedIds.clear();
    this.applyFilterSortAndPagination();
  };

  constructor(private ordersService: OrdersService, private router: Router) {}

  ngOnInit(): void {
    // escuta mudança de breakpoint
    if (typeof this.desktopMedia?.addEventListener === 'function') {
      this.desktopMedia.addEventListener('change', this.onMediaChange);
    } else if (typeof this.desktopMedia?.addListener === 'function') {
      // compat
      this.desktopMedia.addListener(this.onMediaChange);
    }

    this.reload();
  }

  ngOnDestroy(): void {
    if (typeof this.desktopMedia?.removeEventListener === 'function') {
      this.desktopMedia.removeEventListener('change', this.onMediaChange);
    } else if (typeof this.desktopMedia?.removeListener === 'function') {
      // compat
      this.desktopMedia.removeListener(this.onMediaChange);
    }
  }

  // helpers de UI
  isDesktopPaginationEnabled(): boolean {
    return !!this.desktopMedia?.matches; // >= sm
  }

  // select de page size (string-safe)
  get pageSizeValue(): string {
    return String(this.pageSize);
  }

  reload(): void {
    this.loading = true;
    this.error = false;

    this.ordersService.findMyOrders().subscribe({
      next: (data: Order[]) => {
        const list = Array.isArray(data) ? data : [];
        this.allOrders = [...list];

        this.computeCounts();
        this.currentPage = 1;
        this.expandedIds.clear();
        this.applyFilterSortAndPagination();

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  setStatusFilter(filter: OrderStatusFilter): void {
    this.statusFilter = filter;
    this.currentPage = 1;
    this.expandedIds.clear();
    this.applyFilterSortAndPagination();
  }

  setSort(value: OrderSort): void {
    const allowed: OrderSort[] = ['NEWEST', 'OLDEST', 'TOTAL_DESC', 'TOTAL_ASC'];
    this.sort = allowed.includes(value) ? value : 'NEWEST';
    this.currentPage = 1;
    this.expandedIds.clear();
    this.applyFilterSortAndPagination();
  }

  setPageSize(value: any): void {
    const n = Number(value);
    const allowed = [5, 8, 12];
    this.pageSize = allowed.includes(n) ? n : 8;
    this.currentPage = 1;
    this.expandedIds.clear();
    this.applyFilterSortAndPagination();
  }

  private applyFilterSortAndPagination(): void {
    let list = this.allOrders;

    // filter
    if (this.statusFilter !== 'ALL') {
      const want = this.statusFilter;
      list = list.filter((o) => (o.status || '').toUpperCase() === want);
    }

    // sort
    list = this.sortOrders(list, this.sort);
    this.visibleOrders = list;

    // ✅ pagination only on desktop
    if (this.isDesktopPaginationEnabled()) {
      this.applyPagination();
    } else {
      this.totalPages = 1;
      this.currentPage = 1;
      this.pagedOrders = this.visibleOrders;
    }
  }

  private sortOrders(list: Order[], sort: OrderSort): Order[] {
    const arr = [...list];

    if (sort === 'NEWEST') {
      arr.sort((a, b) => this.toTimestamp(b.createdAt) - this.toTimestamp(a.createdAt));
      return arr;
    }

    if (sort === 'OLDEST') {
      arr.sort((a, b) => this.toTimestamp(a.createdAt) - this.toTimestamp(b.createdAt));
      return arr;
    }

    if (sort === 'TOTAL_DESC') {
      arr.sort((a, b) => this.toMoneyNumber(b.total) - this.toMoneyNumber(a.total));
      return arr;
    }

    arr.sort((a, b) => this.toMoneyNumber(a.total) - this.toMoneyNumber(b.total));
    return arr;
  }

  private computeCounts(): void {
    const normalized = (s: string) => (s || '').toUpperCase();
    let pending = 0;
    let paid = 0;
    let cancelled = 0;

    for (const o of this.allOrders) {
      const s = normalized(o.status);
      if (s === 'PENDING') pending++;
      else if (s === 'PAID') paid++;
      else if (s === 'CANCELLED') cancelled++;
    }

    this.counts = { all: this.allOrders.length, pending, paid, cancelled };
  }

  filterBtnClass(filter: OrderStatusFilter): string {
    const active = this.statusFilter === filter;
    return [
      active
        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
        : 'bg-transparent text-gray-700 hover:bg-white/70',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
    ].join(' ');
  }

  private applyPagination(): void {
    const total = this.visibleOrders.length;
    const size = Math.max(1, this.pageSize);

    this.totalPages = Math.max(1, Math.ceil(total / size));
    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;

    const start = (this.currentPage - 1) * size;
    const end = start + size;

    this.pagedOrders = this.visibleOrders.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    this.expandedIds.clear();
    this.applyPagination();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    this.expandedIds.clear();
    this.applyPagination();
  }

  get pageStart(): number {
    if (!this.isDesktopPaginationEnabled()) return 1;
    if (this.visibleOrders.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    if (!this.isDesktopPaginationEnabled()) return this.visibleOrders.length;
    if (this.visibleOrders.length === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.visibleOrders.length);
  }

  toggle(orderId: number): void {
    if (this.expandedIds.has(orderId)) this.expandedIds.delete(orderId);
    else this.expandedIds.add(orderId);
  }

  isExpanded(orderId: number): boolean {
    return this.expandedIds.has(orderId);
  }

  statusLabel(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'Pendente';
      case 'PAID':
        return 'Pago';
      case 'CANCELLED':
        return 'Cancelado';
      case 'ALL':
        return 'Todos';
      default:
        return status || '—';
    }
  }

  statusBadgeClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'PAID':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-900 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  formatMoney(value: PriceLike): string {
    const n = this.toMoneyNumber(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
  }

  lineTotal(item: OrderItem): number {
    const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
    return this.toMoneyNumber(item.unitPrice) * qty;
  }

  hasDiscount(order: Order): boolean {
    return this.toMoneyNumber(order.discountAmount) > 0;
  }

  private toMoneyNumber(value: PriceLike): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const raw = (value ?? '').toString().trim();
    const normalized = raw.replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  private toTimestamp(iso: string): number {
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
