import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService, Order } from '../../../services/orders.service';

// Importa los nuevos componentes individuales
import { PageHeaderComponent } from './page-header/page-header.component';
import { OrderFilterComponent, FilterData, ResumenData } from './order-filter/order-filter.component';
import { OrderCardComponent } from './order-card/order-card.component';
import { CreateOrderModalComponent } from './create-order-modal/create-order-modal.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  // Asegúrate de importar los nuevos componentes aquí
  imports: [
    CommonModule,
    PageHeaderComponent,
    OrderFilterComponent,
    OrderCardComponent,
    CreateOrderModalComponent,
  ],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];

  filters = {
    numeroOrden: '',
    estado: '',
  };

  resumen: ResumenData = {
    total: 0,
    pagado: 0,
    pendiente: 0,
    cancelado: 0,
  };

  isCreateModalVisible = false;

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.getOrders().subscribe({
      next: (data) => {
        this.allOrders = data;
        this.applyFilters();
        this.updateResumen();
      },
      error: (err) => console.error('Error cargando órdenes:', err),
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.allOrders.filter((order) => {
      const estadoMatch = this.filters.estado ? order.estadoPago === this.filters.estado : true;
      const numeroMatch = this.filters.numeroOrden ? order.numeroOrden.includes(this.filters.numeroOrden) : true;
      return estadoMatch && numeroMatch;
    });
  }

  updateResumen(): void {
    this.resumen = {
      total: this.allOrders.length,
      pagado: this.allOrders.filter((o) => o.estadoPago === 'pagado').length,
      pendiente: this.allOrders.filter((o) => o.estadoPago === 'pendiente').length,
      cancelado: this.allOrders.filter((o) => o.estadoPago === 'cancelado').length,
    };
  }

  // --- Manejadores de eventos de componentes hijos ---

  handleFilterChange(newFilters: FilterData): void {
    this.filters = { ...this.filters, ...newFilters };
    this.applyFilters();
  }

  handleClearFilters(): void {
    this.filters = { numeroOrden: '', estado: '' };
    this.applyFilters();
  }

  handleCreateOrder(newOrderData: Omit<Order, '_id'>): void {
    this.ordersService.createOrder(newOrderData).subscribe({
      next: () => {
        this.loadOrders(); // Recargar para ver la nueva orden
        this.isCreateModalVisible = false;
      },
      error: (err) => console.error('Error creando orden:', err),
    });
  }

  handleMarkAsPaid(order: Order): void {
    const confirmation = confirm(`¿Marcar la Orden #${order.numeroOrden} como "Pagada"?`);
    if (!confirmation) return;

    // Lógica para actualizar (aquí simulada en el front)
    const orderToUpdate = this.allOrders.find(o => o.numeroOrden === order.numeroOrden);
    if (orderToUpdate) {
      orderToUpdate.estadoPago = 'pagado';
      this.applyFilters(); // Re-aplica filtros para actualizar la vista
      this.updateResumen(); // Actualiza el contador
      // En un caso real, llamarías aquí al servicio:
      // this.ordersService.updateOrder(order.id, { estadoPago: 'pagado' }).subscribe(...);
    }
  }
}
