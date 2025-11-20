import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService, Order } from '../../../services/orders.service';
import { QuotationService } from '../../../services/quotation.service';
import {
  OrderFilterComponent,
  FilterData,
  ResumenData,
} from './order-filter/order-filter.component';
import { OrderCardComponent } from './order-card/order-card.component';
import { ViewOrderModalComponent } from './view-order-modal/view-order-modal.component';
import { ProductoFinal } from '../../../models/Productos';
import { ProductsService } from '../../../services/product.service';
import { Quotation, QuotationDetail } from '../../../models/quotation.types';
import { forkJoin } from 'rxjs';
import { CreateOrderModalComponent } from './create-order-modal/create-order-modal.component';
import {
  CreateShippingDto,
  ShippingsService,
} from '../../../services/shippings.service';
import { PaymentsService } from '../../../services/payments.service';
import { PaymentMethod, PaymentStatus } from '../../../models/payment.model';
import { AuthService, Role } from '../../../services/auth.service';
import { HeaderCrudComponent } from "../../../shared/header-dashboard/heeader-crud.component";

@Component({
  selector: 'app-orders',
  standalone: true,
  // Asegúrate de importar los nuevos componentes aquí
  imports: [
    CommonModule,
    OrderCardComponent,
    ViewOrderModalComponent,
    CreateOrderModalComponent,
    HeaderCrudComponent
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

  // View mode signal
  viewMode = signal<'grid' | 'list'>('grid');

  filters = {
    texto : '',
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


  // --- Propiedades para manejar el estado de la UI ---
  isUpdating = false;
  updateError: string | null = null;
  viewInvoice = false;

  isProcessing = false; // Nueva propiedad para indicar el estado de procesamiento
  orderToProcess: Order | null = null; // Orden que se está procesando
  quotationToValidate: (Quotation & { details: QuotationDetail[] }) | null =
    null;
  productsToValidate: {
    producto: ProductoFinal | null;
    cantidad_solicitada: number;
  }[] = []; // Productos obtenidos para validar


  role: Role | null = null;
  Role = Role; // Hacer que la enumeración Role esté disponible en la plantilla

  constructor(
    private ordersService: OrdersService,
    private shippingService: ShippingsService,
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private quotationService: QuotationService,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.loadOrders();


    this.authService.currentUserRole$.subscribe((role) => {
      this.role = role;
    });
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
      const numeroMatch = this.filters.texto
        ? order.numeroOrden.toLowerCase().includes(this.filters.texto.toLowerCase())
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
   * Llama al servicio para actualizar la orden en la base de datos y,
   * si tiene éxito, actualiza la orden en la lista local y cierra el modal.
   * @param updatedOrder El objeto de la orden con los datos modificados desde el modal.
   */
  handleSaveChanges(updatedOrder: Order): void {
    // 1. Validar que tenemos una orden para actualizar
    if (!updatedOrder || !updatedOrder.id) {
      console.error(
        'Error: No se proporcionó una orden válida para actualizar.'
      );
      return;
    }

    this.isUpdating = true;
    this.updateError = null;

    // 2. Extraer el ID y el resto de los datos para la petición PUT/PATCH.
    // El servicio espera el ID como parámetro y el resto de los datos en el cuerpo.
    const { id, ...orderData } = updatedOrder;

    // 3. Llamar al servicio y suscribirse a la respuesta.
    this.ordersService.updateOrder(id, orderData).subscribe({
      // 4. 'next' se ejecuta si la llamada a la API fue exitosa.
      next: (savedOrder) => {
        // Actualiza la lista local con los datos frescos del servidor.
        const index = this.allOrders.findIndex((o) => o.id === savedOrder.id);
        if (index !== -1) {
          this.allOrders[index] = savedOrder;
        }

        // Refresca la vista y cierra el modal.
        this.orderToEdit = null;
        this.applyFilters();
        this.updateResumen();
        this.isUpdating = false;
      },
      // 5. 'error' se ejecuta si la API devuelve un error.
      error: (err) => {
        console.error('Error al actualizar la orden:', err);
        this.updateError = 'No se pudo guardar la orden. Inténtalo de nuevo.';
        this.isUpdating = false;
      },
    });
  }

  handleFilterChange(newFilters: FilterData): void {
    this.filters = { ...this.filters, ...newFilters };
    this.applyFilters();
  }

  handleClearFilters(): void {
    this.filters = { texto: '', estado: '' };
    this.applyFilters();
  }

  handleViewChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  handleCreateOrder(newOrderData: Omit<Order, 'id'>): void {
    console.log('Nueva Orden RECIBIDA:', newOrderData);
    this.ordersService.createOrder(newOrderData).subscribe({
      next: () => {
        this.loadOrders(); // Recargar para ver la nueva orden
        this.isCreateModalVisible = false;
      },
      error: (err) => console.error('Error creando orden:', err),
    });
  }

  processOrder(order: Order): void {

    this.isProcessing = true; // Mostrar el modal de procesamiento
    this.orderToProcess = order; // Establecer la orden que se está procesando

    console.log('Procesando orden:', order);
  }

  addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

  handleProcessOrder(shippingData: CreateShippingDto): void {
    if (!this.orderToProcess) {
      console.error('No hay una orden seleccionada para procesar.');
      return;
    }

    // Aquí puedes manejar el proceso de envío utilizando shippingData
    console.log('Datos de envío recibidos:', shippingData);

    // Crear el envío en el backend
    this.shippingService.createShipping(shippingData).subscribe({
      next: (newShipping) => {
        alert('Envío creado exitosamente.');
        console.log('Envío creado exitosamente:', newShipping);
      },
      error: (err) => {
        console.error('Error creando el envío:', err);
        alert(
          'Hubo un error al crear el envío. Por favor, inténtalo de nuevo.'
        );
        return;
      },
    });

    const userId = this.authService.getUserId();

    if (!userId) {
      console.error('No se pudo obtener el ID del usuario.');
      return;
    }

    const payloadPayment = {
      order_id: this.orderToProcess.id,
      monto: this.orderToProcess.precioTotal,
      fechaLimitePago: this.addDays(new Date(), 30).toString(), // hoy mas 30 dias 1 mes
      metodo: 'transferencia' as PaymentMethod,
      createdBy: userId,
    };

    this.ordersService
      .updateOrderStatus(this.orderToProcess.id, 'pagado')
      .subscribe({
        next: () => {
          console.log('Estado de la orden actualizado a "pagado".');
          this.loadOrders(); // Recargar la lista de órdenes
        },
        error: (err) => {
          console.error('Error al actualizar el estado de la orden:', err);
        },
      });

    this.paymentsService.createPayment(payloadPayment).subscribe({
      next: (newPayment) => {
        alert('Pago creado exitosamente.');
        console.log('Pago creado exitosamente:', newPayment);
      },
      error: (err) => {
        console.error('Error creando el pago:', err);
        alert('Hubo un error al crear el pago. Por favor, inténtalo de nuevo.');
      },
    });

    this.isProcessing = false; // Cerrar el modal de procesamiento
    this.orderToProcess = null; // Limpiar la orden procesada
  }

  handleViewInvoice(order: Order): void{
    this.viewInvoice = true

  }
}
