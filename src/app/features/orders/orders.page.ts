import { Component, OnInit } from '@angular/core';
import { OrdersService, Order } from '../../core/services/orders.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  template: `
    <div class="page">
      <div class="card w-full max-w-2xl">
        <h1 class="text-lg font-semibold mb-4">Meus pedidos</h1>

        @if (loading) {
        <p class="text-sm text-gray-600">Carregando...</p>
        } @else if (error) {
        <p class="text-sm text-red-600">Erro ao carregar pedidos.</p>
        } @else if (orders.length === 0) {
        <p class="text-sm text-gray-600">Você ainda não fez pedidos.</p>
        } @else {
        <div class="space-y-4">
          @for (order of orders; track order.id) {
          <div class="border border-gray-200 rounded-lg p-4 bg-white">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">Pedido #{{ order.id }}</p>
                <p class="text-xs text-gray-600">Status: {{ order.status }}</p>
                <p class="text-xs text-gray-600">Em: {{ formatDate(order.createdAt) }}</p>
              </div>

              <div class="text-sm font-semibold text-gray-900">
                Total: {{ formatMoney(order.total) }}
              </div>
            </div>

            <ul class="mt-3 space-y-1 text-sm text-gray-700">
              @for (item of order.items; track item.id) {
              <li class="flex items-center justify-between gap-3">
                <span class="truncate">
                  {{ item.productName }}
                </span>
                <span class="shrink-0 text-gray-600"> {{ item.quantity }}x </span>
              </li>
              }
            </ul>

            <div class="mt-3 text-xs text-gray-600">
              Frete: {{ formatMoney(order.shippingFee) }} • Subtotal:
              {{ formatMoney(order.subtotal) }}
            </div>

            <div class="mt-3 text-xs text-gray-600">
              Entrega: {{ order.shippingAddress.street }}, {{ order.shippingAddress.number }} —
              {{ order.shippingAddress.city }}/{{ order.shippingAddress.state }} —
              {{ order.shippingAddress.zip }}
            </div>
          </div>
          }
        </div>
        }
      </div>
    </div>
  `,
})
export class OrdersPage implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = false;

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.ordersService.findMyOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  formatMoney(value: any): string {
    // backend manda string tipo "464.97"
    const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
    const safe = Number.isFinite(n) ? n : 0;

    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe);
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('pt-BR');
  }
}
