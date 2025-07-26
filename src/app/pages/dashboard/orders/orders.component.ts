import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService, Order } from '../../../services/orders.service';

// Importa los nuevos componentes individuales
import { PageHeaderComponent } from './page-header/page-header.component';
import {
  OrderFilterComponent,
  FilterData,
  ResumenData,
} from './order-filter/order-filter.component';
import { OrderCardComponent } from './order-card/order-card.component';
import { CreateOrderModalComponent } from './create-order-modal/create-order-modal.component';
import { EditOrderModalComponent } from './edit-order-modal/edit-order-modal.component';
import { ViewOrderModalComponent } from './view-order-modal/view-order-modal.component';

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
    EditOrderModalComponent,
    ViewOrderModalComponent,
  ],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  handleDeleteOrder(_t9: Order) {
    // Aquí puedes implementar la lógica para eliminar una orden
    // Por ejemplo, podrías mostrar un modal de confirmación y luego llamar al servicio para eliminar la orden
    console.log('Eliminar orden:', _t9);
    alert(`Orden #${_t9.numeroOrden} eliminada.`);
    // Lógica de eliminación aquí, como llamar a ordersService.deleteOrder(_t9.id).subscribe(...)
    // Luego recargar las órdenes o actualizar la lista filtrada

    //simulación de eliminación en el frontend:
    this.allOrders = this.allOrders.filter(
      (order) => order.numeroOrden !== _t9.numeroOrden
    );
    this.applyFilters(); // Re-aplica filtros para actualizar la vista
    this.updateResumen(); // Actualiza el contador

  }
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
  orderToEdit: Order | null = null; // ¡NUEVO!
  orderToView: Order | null = null;

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
      const estadoMatch = this.filters.estado
        ? order.estadoPago === this.filters.estado
        : true;
      const numeroMatch = this.filters.numeroOrden
        ? order.numeroOrden.includes(this.filters.numeroOrden)
        : true;
      return estadoMatch && numeroMatch;
    });
  }

  /**
   * Se activa cuando el usuario hace clic en "Ver" en una tarjeta de orden.
   * Establece la orden a visualizar, lo que causa que el modal se muestre.
   */
  handleViewOrder(order: Order): void {
    this.orderToView = order;
  }

  updateResumen(): void {
    this.resumen = {
      total: this.allOrders.length,
      pagado: this.allOrders.filter((o) => o.estadoPago === 'pagado').length,
      pendiente: this.allOrders.filter((o) => o.estadoPago === 'pendiente')
        .length,
      cancelado: this.allOrders.filter((o) => o.estadoPago === 'cancelado')
        .length,
    };
  }

  // --- Manejadores de eventos de componentes hijos ---

  /**
   * Se activa cuando el usuario hace clic en "Editar" en una tarjeta de orden.
   * Establece la orden a editar, lo que causa que el modal de edición se muestre.
   */
  handleEditOrder(order: Order): void {
    this.orderToEdit = order;
  }

  /**
   * Se activa cuando el usuario guarda los cambios en el modal de edición.
   * Actualiza la orden en la lista principal y recarga la vista.
   */
  handleSaveChanges(updatedOrder: any): void {
    console.log('ORDEN PARA ACTUALIZAR:', updatedOrder);
    // Lógica para actualizar la orden en la base de datos
    // this.ordersService.updateOrder(updatedOrder.id, updatedOrder).subscribe(...)

    // Simulación en el frontend:
    const index = this.allOrders.findIndex(
      (o) => o.numeroOrden === updatedOrder.numeroOrden
    );
    if (index !== -1) {
      this.allOrders[index] = updatedOrder;
    }

    this.orderToEdit = null; // Cierra el modal
    this.applyFilters(); // Refresca la lista filtrada
    this.updateResumen(); // Actualiza los contadores
  }

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
    const confirmation = confirm(
      `¿Marcar la Orden #${order.numeroOrden} como "Pagada"?`
    );
    if (!confirmation) return;

    // Lógica para actualizar (aquí simulada en el front)
    const orderToUpdate = this.allOrders.find(
      (o) => o.numeroOrden === order.numeroOrden
    );
    if (orderToUpdate) {
      orderToUpdate.estadoPago = 'pagado';
      this.applyFilters(); // Re-aplica filtros para actualizar la vista
      this.updateResumen(); // Actualiza el contador
      // En un caso real, llamarías aquí al servicio:
      // this.ordersService.updateOrder(order.id, { estadoPago: 'pagado' }).subscribe(...);
    }
  }
}
