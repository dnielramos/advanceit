import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService, Role } from '../../../../services/auth.service';
import { CreateOrderModalComponent } from '../create-order-modal/create-order-modal.component';
import { CreateShippingDto, ShippingsService } from '../../../../services/shippings.service';
import { PaymentsService } from '../../../../services/payments.service';
import { PaymentMethod } from '../../../../models/payment.model';
import {
  faArrowLeft,
  faReceipt,
  faUser,
  faCalendarAlt,
  faDollarSign,
  faShoppingCart,
  faBox,
  faEdit,
  faTrash,
  faCheck,
  faSpinner,
  faExclamationTriangle,
  faBoxOpen,
  faInfoCircle,
  faMapMarkerAlt,
  faTag,
  faWarehouse,
  faTimes,
  faFileInvoiceDollar,
  faExternalLinkAlt,
  faPrint
} from '@fortawesome/free-solid-svg-icons';
import { OrdersService, Order, OrderProducts } from '../../../../services/orders.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, CreateOrderModalComponent],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly shippingService = inject(ShippingsService);
  private readonly paymentsService = inject(PaymentsService);

  // Icons
  faArrowLeft = faArrowLeft;
  faReceipt = faReceipt;
  faUser = faUser;
  faCalendarAlt = faCalendarAlt;
  faDollarSign = faDollarSign;
  faShoppingCart = faShoppingCart;
  faBox = faBox;
  faEdit = faEdit;
  faTrash = faTrash;
  faCheck = faCheck;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;
  faBoxOpen = faBoxOpen;
  faInfoCircle = faInfoCircle;
  faMapMarkerAlt = faMapMarkerAlt;
  faTag = faTag;
  faWarehouse = faWarehouse;
  faFileInvoiceDollar = faFileInvoiceDollar;
  faExternalLinkAlt = faExternalLinkAlt;
  faPrint = faPrint;

  // State
  order = signal<Order | null>(null);
  products = signal<OrderProducts[]>([]);
  isLoading = signal(false);
  isProcessing = signal(false);
  isProcessingModalOpen = signal(false);
  error = signal<string | null>(null);
  expandedProducts = signal<Set<string>>(new Set());

  isAdmin = computed(() => this.authService.hasRole(Role.Admin));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('🔵 [OrderDetail] ngOnInit - ID de ruta:', id);
    if (id) {
      this.loadOrder(id);
    } else {
      console.error('❌ [OrderDetail] No se encontró ID en la ruta');
      this.error.set('ID de orden no válido');
    }
  }

  loadOrder(id: string): void {
    console.log('📦 [OrderDetail] loadOrder - Iniciando carga de orden:', id);
    this.isLoading.set(true);
    this.error.set(null);

    this.ordersService.getOrderById(id).subscribe({
      next: (orderData) => {
        console.log('✅ [OrderDetail] Orden cargada exitosamente:', orderData);
        console.log('   - numeroOrden:', orderData.numeroOrden);
        console.log('   - estadoPago:', orderData.estadoPago);
        console.log('   - precioTotal:', orderData.precioTotal);
        console.log('   - cantidad de productos en orden:', orderData.productos?.length || 0);
        console.log('   - ID para cargar productos:', id);
        this.order.set(orderData);
        this.loadProducts(id);
      },
      error: (err) => {
        console.error('❌ [OrderDetail] Error al cargar orden:', err);
        console.error('   - Message:', err.message);
        console.error('   - Error completo:', err);
        this.error.set(`Error al cargar la orden: ${err.message}`);
        this.isLoading.set(false);
      },
    });
  }

  loadProducts(orderId: string): void {
    console.log('🛒 [OrderDetail] loadProducts - Iniciando carga de productos para orden:', orderId);
    this.ordersService.getOrderProducts(orderId).subscribe({
      next: (productsData) => {
        console.log('✅ [OrderDetail] Productos cargados exitosamente');
        console.log('   - Cantidad de productos:', productsData.length);
        console.log('   - Productos completos:', productsData);
        
        if (productsData.length === 0) {
          console.warn('⚠️ [OrderDetail] La orden no tiene productos asociados');
        } else {
          console.log('   - Primer producto:', productsData[0]);
          productsData.forEach((product, index) => {
            console.log(`   📦 Producto ${index + 1}:`, {
              id: product.id,
              SKU: product.SKU,
              nombre: product.nombre,
              cantidad: product.cantidad,
              precio: product.precio
            });
          });
        }
        
        this.products.set(productsData);
        this.isLoading.set(false);
        console.log('   - Signal products actualizado, isLoading = false');
      },
      error: (err) => {
        console.error('❌ [OrderDetail] Error al cargar productos:', err);
        console.error('   - Message:', err.message);
        console.error('   - Status:', err.status);
        console.error('   - Error completo:', err);
        console.warn('⚠️ [OrderDetail] Continuando con lista vacía de productos');
        // Continue even if products fail to load, just show empty list
        this.products.set([]);
        this.isLoading.set(false);
      },
    });
  }

  toggleProductDetails(productId: string): void {
    const expanded = new Set(this.expandedProducts());
    if (expanded.has(productId)) {
      expanded.delete(productId);
    } else {
      expanded.add(productId);
    }
    this.expandedProducts.set(expanded);
  }

  isProductExpanded(productId: string): boolean {
    return this.expandedProducts().has(productId);
  }

  openProcessModal(): void {
    this.isProcessingModalOpen.set(true);
  }

  closeProcessModal(): void {
    this.isProcessingModalOpen.set(false);
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  handleProcessOrder(shippingData: CreateShippingDto): void {
    const currentOrder = this.order();
    if (!currentOrder) {
      console.error('No hay una orden seleccionada para procesar.');
      return;
    }

    this.isProcessing.set(true);
    console.log('Datos de envío recibidos:', shippingData);

    // 1. Crear el envío en el backend
    this.shippingService.createShipping(shippingData).subscribe({
      next: (newShipping) => {
        console.log('Envío creado exitosamente:', newShipping);
        this.toast.success('Envío creado exitosamente.');
        this.proceedToPaymentAndStatus(currentOrder);
      },
      error: (err) => {
        console.error('Error creando el envío:', err);
        this.toast.error('Hubo un error al crear el envío.');
        this.isProcessing.set(false);
        this.closeProcessModal();
      },
    });
  }

  private proceedToPaymentAndStatus(currentOrder: Order): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario.');
      this.isProcessing.set(false);
      this.closeProcessModal();
      return;
    }

    // 2. Crear el pago
    const payloadPayment = {
      order_id: currentOrder.id,
      monto: currentOrder.precioTotal,
      fechaLimitePago: this.addDays(new Date(), 30).toString(), // hoy mas 30 dias
      metodo: 'transferencia' as PaymentMethod,
      createdBy: userId,
    };

    this.paymentsService.createPayment(payloadPayment).subscribe({
      next: (newPayment) => {
        console.log('Pago creado exitosamente:', newPayment);
        this.toast.success('Pago registrado correctamente.');

        // 3. Actualizar estado a "pagado"
        this.ordersService.updateOrderStatus(currentOrder.id, 'pagado').subscribe({
          next: () => {
            this.toast.success('Orden procesada y marcada como PAGADO.');
            this.loadOrder(currentOrder.id); // Recargar la orden
            this.isProcessing.set(false);
            this.closeProcessModal();
          },
          error: (err) => {
            console.error('Error al actualizar el estado de la orden:', err);
            this.toast.error('Error al actualizar estado de la orden.');
            this.isProcessing.set(false);
            this.closeProcessModal();
          },
        });
      },
      error: (err) => {
        console.error('Error creando el pago:', err);
        this.toast.error('Hubo un error al crear el registro de pago.');
        this.isProcessing.set(false);
        this.closeProcessModal();
      },
    });
  }

  handleReject(): void {
    const currentOrder = this.order();
    if (!currentOrder) return;

    if (!confirm(`¿Estás seguro de RECHAZAR la orden #${currentOrder.numeroOrden}?`)) {
      return;
    }

    this.isProcessing.set(true);
    this.ordersService.updateOrderStatus(currentOrder.id, 'no_pagado').subscribe({
      next: () => {
        this.toast.success('Orden rechazada correctamente.');
        this.loadOrder(currentOrder.id);
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.toast.error(`Error al rechazar: ${err.message}`);
        this.isProcessing.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/orders']);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pagado':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'no_pagado':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  }

  getStatusLabel(status: string): string {
    if (status === 'pagado') return 'Procesado';
    if (status === 'no_pagado') return 'Rechazado';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  }

  // ======================================================
  // Cotización
  // ======================================================
  
  /**
   * Verifica si la orden tiene una cotización asociada
   */
  hasQuotation(): boolean {
    const currentOrder = this.order();
    return !!(currentOrder?.quotationId);
  }

  /**
   * Navega a la página de detalle de la cotización
   */
  goToQuotation(): void {
    const currentOrder = this.order();
    if (currentOrder?.quotationId) {
      this.router.navigate(['/dashboard/cotizaciones', currentOrder.quotationId], {
        queryParams: { from: 'ordenes', orderId: currentOrder.id }
      });
    }
  }
}
