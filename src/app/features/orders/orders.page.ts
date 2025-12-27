import { Component, OnInit } from '@angular/core';
import { OrdersService, Order } from '../../core/services/orders.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-orders-page',
  imports: [DatePipe],
  standalone: true,
  template: `
    <h1>Meus Pedidos</h1>

    @if (loading) {
    <p>Carregando pedidos...</p>
    } @else if (orders.length === 0) {
    <p>Você ainda não fez nenhum pedido.</p>
    } @else { @for (order of orders; track order.id) {
    <div class="order">
      <p>
        <strong>Pedido #{{ order.id }}</strong>
      </p>
      <p>Status: {{ order.status }}</p>
      <p>Total: R$ {{ order.total }}</p>
      <p>Data: {{ order.createdAt | date : 'short' }}</p>

      <ul>
        @for (item of order.items; track item.productName) {
        <li>{{ item.productName }} — {{ item.quantity }}x — R$ {{ item.unitPrice }}</li>
        }
      </ul>

      <hr />
    </div>
    } }
  `,
})
export class OrdersPage implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.ordersService.findMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
