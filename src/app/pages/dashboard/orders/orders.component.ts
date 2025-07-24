import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus, faFilter, faDownload, faFileExport, faPrint,
  faPen, faEye, faCheckSquare, faTrash, faSearch, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { OrdersService, Order, Product } from '../../../services/orders.service';
import { NexsysProduct } from '../../../models/Productos';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, NgIf, NgFor],
templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  faPlus = faPlus;
  faFilter = faFilter;
  faDownload = faDownload;
  faFileExport = faFileExport;
  faPrint = faPrint;
  faPen = faPen;
  faEye = faEye;
  faCheckSquare = faCheckSquare;
  faTrash = faTrash;
  faSearch = faSearch;
  faTimes = faTimes;

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  filterEstado: string = '';
  filterNumeroOrden: string = '';

  showCreateModal = false;

  newOrderClient = '';
  newOrderNote = '';
  newOrderProducts: Product[] = [];
  newProductInput = '';
  productSearchResult: Product | null = null;
  productSearchError = '';

  resumen = {
    total: 0,
    pagado: 0,
    no_pagado: 0,
    pendiente: 0,
    cancelado: 0
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
      error: (err) => console.error('Error cargando órdenes:', err)
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const estadoMatch = this.filterEstado ? order.estadoPago === this.filterEstado : true;
      const numeroMatch = this.filterNumeroOrden ? order.numeroOrden.includes(this.filterNumeroOrden) : true;
      return estadoMatch && numeroMatch;
    });
  }

  updateResumen(): void {
    this.resumen.total = this.orders.length;
    this.resumen.pagado = this.orders.filter(o => o.estadoPago === 'pagado').length;
    this.resumen.no_pagado = this.orders.filter(o => o.estadoPago === 'no_pagado').length;
    this.resumen.pendiente = this.orders.filter(o => o.estadoPago === 'pendiente').length;
    this.resumen.cancelado = this.orders.filter(o => o.estadoPago === 'cancelado').length;
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

    this.ordersService.searchProductBySku(this.newProductInput.trim()).subscribe({
      next: (product) => {
        console.log('Producto encontrado:', product?.["data"].return[0]);
        if (product?.["data"].return) {
          this.productSearchResult = this.mapNexsysProductToProduct(product["data"].return[0]);
        } else {
          this.productSearchError = 'Producto no encontrado';
        }
      },
      error: () => {
        this.productSearchError = 'Producto no encontrado';
      }
    });
  }


  mapNexsysProductToProduct(nexsysProduct: NexsysProduct): Product {
  return {
    nombre: nexsysProduct.name,
    sku: nexsysProduct.sku,
    precio: nexsysProduct.price,
    _id: nexsysProduct.sku, // Assuming sku can be used as a unique identifier
    // Include additional fields from NexsysProduct as part of the [key: string]: any
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
    // Example: Generate a unique order number (replace with your logic)
    return `SH-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
  }

  getCurrentDateTime(): { fecha: string; hora: string } {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // e.g., "2025-07-24"
    const hora = now.toTimeString().split(' ')[0]; // e.g., "17:32:00"
    return { fecha, hora };
  }

  mapNexsysProductsToSkus(nexsysProducts: Product[]): string[] {
  return nexsysProducts.map(product => product.sku);
}

createOrder(): void {
    const { fecha, hora } = this.getCurrentDateTime();
    const newOrder: Order = {
      numeroOrden: this.generateOrderNumber(),
      fecha,
      hora,
      estadoPago: 'pendiente',
      precioTotal: this.calculateTotal(),
      productos: this.mapNexsysProductsToSkus(this.newOrderProducts),
      cliente: this.newOrderClient,
      shippingNo: `ENVIO-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      notas: this.newOrderNote,
    };

    this.ordersService.createOrder(newOrder).subscribe({
      next: () => {
        this.loadOrders();
        this.closeCreateModal();
      },
      error: (err: any) => console.error('Error creando orden:', err),
    });
  }
}
