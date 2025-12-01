import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
} from '@fortawesome/free-solid-svg-icons';
import { OrdersService, Order, OrderProducts } from '../../../../services/orders.service';
import { ToastService } from 'angular-toastify';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly toast = inject(ToastService);

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
  faBoxOpen = faBoxOpen;
  faInfoCircle = faInfoCircle;
  faMapMarkerAlt = faMapMarkerAlt;
  faTag = faTag;
  faWarehouse = faWarehouse;

  // State
  order = signal<Order | null>(null);
  products = signal<OrderProducts[]>([]);
  isLoading = signal(false);
  isProcessing = signal(false);
  error = signal<string | null>(null);
  expandedProducts = signal<Set<string>>(new Set());

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

  handleDelete(): void {
    const currentOrder = this.order();
    if (!currentOrder) return;

    if (!confirm(`¿Estás seguro de eliminar la orden #${currentOrder.numeroOrden}? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.isProcessing.set(true);

    this.ordersService.deleteOrder(currentOrder.id).subscribe({
      next: () => {
        this.toast.success('Orden eliminada correctamente');
        this.router.navigate(['/dashboard/orders']);
      },
      error: (err) => {
        this.toast.error(`Error al eliminar: ${err.message}`);
        this.isProcessing.set(false);
      },
    });
  }

  handleProcess(): void {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.isProcessing.set(true);

    this.ordersService.updateOrderStatus(currentOrder.id, 'pagado').subscribe({
      next: () => {
        this.toast.success('Orden procesada correctamente');
        this.loadOrder(currentOrder.id);
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.toast.error(`Error al procesar: ${err.message}`);
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
    if (status === 'no_pagado') return 'No Pagado';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  }
}
