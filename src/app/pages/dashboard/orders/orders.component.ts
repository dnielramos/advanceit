import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faFilter,
  faDownload,
  faFileExport,
  faPrint,
  faPen,
  faEye,
  faCheckSquare,
  faTrash,
  faSearch,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  OrdersService,
  Order,
  Product,
} from '../../../services/orders.service';
import { NexsysProduct } from '../../../models/Productos';
import { OrderFilterComponent } from './order-filter/order-filter.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, NgIf, NgFor, OrderFilterComponent],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  // --- Iconos ---
  faPlus = faPlus;
  faFilter = faFilter;
  faDownload = faDownload;
  faFileExport = faFileExport;
  faPrint = faPrint;
  faPen = faPen;
  faEye = faEye;
  faCheckSquare = faCheckSquare; // Icono para el nuevo botón
  faTrash = faTrash;
  faSearch = faSearch;
  faTimes = faTimes;

  // --- Listas y Filtros ---
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  filterEstado: string = '';
  filterNumeroOrden: string = '';

  // --- Estado del Modal ---
  showCreateModal = false;

  // --- Datos de Nueva Orden ---
  newOrderClient = '';
  newOrderNote = '';
  newOrderProducts: Product[] = [];
  newProductInput = '';
  productSearchResult: Product | null = null;
  productSearchError = '';

  // --- Resumen ---
  resumen = {
    total: 0,
    pagado: 0,
    no_pagado: 0,
    pendiente: 0,
    cancelado: 0,
  };

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.applyFilters();
        this.updateResumen();
      },
      error: (err) => console.error('Error cargando órdenes:', err),
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter((order) => {
      const estadoMatch = this.filterEstado
        ? order.estadoPago === this.filterEstado
        : true;
      const numeroMatch = this.filterNumeroOrden
        ? order.numeroOrden.includes(this.filterNumeroOrden)
        : true;
      return estadoMatch && numeroMatch;
    });
  }

  updateResumen(): void {
    this.resumen.total = this.orders.length;
    this.resumen.pagado = this.orders.filter(
      (o) => o.estadoPago === 'pagado'
    ).length;
    this.resumen.no_pagado = this.orders.filter(
      (o) => o.estadoPago === 'no_pagado'
    ).length;
    this.resumen.pendiente = this.orders.filter(
      (o) => o.estadoPago === 'pendiente'
    ).length;
    this.resumen.cancelado = this.orders.filter(
      (o) => o.estadoPago === 'cancelado'
    ).length;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterEstado = '';
    this.filterNumeroOrden = '';
    this.applyFilters();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newOrderClient = '';
    this.newOrderNote = '';
    this.newOrderProducts = [];
    this.newProductInput = '';
    this.productSearchResult = null;
    this.productSearchError = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  searchProduct(): void {
    this.productSearchResult = null;
    this.productSearchError = '';
    if (!this.newProductInput.trim()) return;

    this.ordersService
      .searchProductBySku(this.newProductInput.trim())
      .subscribe({
        next: (product) => {
          if (product?.['data'].return) {
            this.productSearchResult = this.mapNexsysProductToProduct(
              product['data'].return[0]
            );
          } else {
            this.productSearchError = 'Producto no encontrado';
          }
        },
        error: () => {
          this.productSearchError =
            'Producto no encontrado o error en la búsqueda.';
        },
      });
  }

  mapNexsysProductToProduct(nexsysProduct: NexsysProduct): Product {
    return {
      nombre: nexsysProduct.name,
      sku: nexsysProduct.sku,
      precio: nexsysProduct.price,
      _id: nexsysProduct.sku,
      category: nexsysProduct.category,
      currency: nexsysProduct.currency,
      image: nexsysProduct.image,
      inventory: nexsysProduct.inventory,
      long_description: nexsysProduct.long_description,
      mark: nexsysProduct.mark,
      parent: nexsysProduct.parent,
      short_description: nexsysProduct.short_description,
      tax_excluded: nexsysProduct.tax_excluded,
    };
  }

  addProductToOrder(product: Product): void {
    this.newOrderProducts.push(product);
    this.newProductInput = '';
    this.productSearchResult = null;
    this.productSearchError = '';
  }

  removeProductFromOrder(index: number): void {
    this.newOrderProducts.splice(index, 1);
  }

  calculateTotal(): number {
    return this.newOrderProducts.reduce((acc, p) => acc + (p.precio || 0), 0);
  }

  private generateOrderNumber(): string {
    return `SH-${Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0')}`;
  }

  getCurrentDateTime(): { fecha: string; hora: string } {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0];
    return { fecha, hora };
  }

  mapNexsysProductsToSkus(nexsysProducts: Product[]): string[] {
    return nexsysProducts.map((product) => product.sku);
  }

  createOrder(): void {
    // --- VALIDACIÓN MODIFICADA ---
    if (!this.newOrderClient.trim()) {
      alert('El nombre del cliente es obligatorio.');
      return;
    }
    if (this.newOrderProducts.length === 0) {
      alert('Debe agregar al menos un producto a la orden.');
      return;
    }

    const { fecha, hora } = this.getCurrentDateTime();
    const newOrder: Omit<Order, '_id'> = {
      // Usamos Omit para indicar que _id lo genera el backend
      numeroOrden: this.generateOrderNumber(),
      fecha,
      hora,
      estadoPago: 'pendiente',
      precioTotal: this.calculateTotal(),
      productos: this.mapNexsysProductsToSkus(this.newOrderProducts),
      cliente: this.newOrderClient.trim(),
      shippingNo: `ENVIO-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`,
      notas: this.newOrderNote.trim(),
    };

    this.ordersService.createOrder(newOrder).subscribe({
      next: () => {
        this.loadOrders();
        this.closeCreateModal();
      },
      error: (err: any) => console.error('Error creando orden:', err),
    });
  }

  /**
   * NUEVO: Método para marcar una orden como pagada.
   * @param order La orden a actualizar
   */
  markAsPaid(order: Order): void {
    if (!order.id) {
      console.error('La orden no tiene un ID para poder actualizarse.');
      return;
    }
    // Mostramos una confirmación al usuario
    const confirmation = confirm(
      `¿Estás seguro de que quieres marcar la Orden #${order.numeroOrden} como "Pagada"? Esta acción no se puede deshacer.`
    );

    if (confirmation) {
      const updatedData = { estadoPago: 'pagado' };

      // BUSCAR EN NUMERO DE ORDEN
      const orderToUpdate = this.filteredOrders.find(o => o.numeroOrden === order.numeroOrden);
      if (!orderToUpdate) {
        console.error('Orden no encontrada.');
        return;
      }

      //ACTUALIZAR EL ARRAY Y MARCAR COMO PAGADA
      orderToUpdate.estadoPago = 'pagado';


      //ACTUALIZA EN FILTERED ORDERS
      this.filteredOrders = this.filteredOrders.map(o => {
        if (o.numeroOrden === order.numeroOrden) {
          return { ...o, estadoPago: 'pagado' };
        }
        return o;
      });

      alert(updatedData.estadoPago);

      // this.ordersService.updateOrder(order.id, updatedData).subscribe({
      //   next: () => {
      //     console.log(`Orden #${order.numeroOrden} marcada como pagada.`);
      //     this.loadOrders(); // Recargamos la lista para ver el cambio
      //   },
      //   error: (err) =>
      //     console.error(
      //       `Error al actualizar la orden #${order.numeroOrden}:`,
      //       err
      //     ),
      // });
    }
  }
}
