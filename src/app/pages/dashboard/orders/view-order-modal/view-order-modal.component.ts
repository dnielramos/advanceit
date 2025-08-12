import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  OrdersService,
  Order,
  Product,
} from '../../../../services/orders.service';

@Component({
  selector: 'app-view-order-modal',
  standalone: true,
  imports: [CommonModule, NgClass, FontAwesomeModule],
  templateUrl: './view-order-modal.component.html',
})
export class ViewOrderModalComponent implements OnInit {
  @Input() order!: Order;
  @Output() close = new EventEmitter<void>();

  // --- Iconos ---
  faTimes = faTimes;

  // --- Estado Local ---
  orderProducts: Product[] = [];
  isLoading = true;

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    // Cuando el componente se inicia, carga los detalles de los productos
    if (this.order && this.order.productos.length > 0) {
      this.loadProductDetails();
    } else {
      this.isLoading = false;
    }
  }

  loadProductDetails(): void {
    this.isLoading = true;

    this.order.productos.forEach((sku) => {
      this.ordersService.searchProductBySku(sku).subscribe({
        next: (product) => {
          this.orderProducts.push(product);
        },
        error: (err) => {
          console.error('Error cargando el producto:', err);
        },
        complete: () => {
          this.isLoading = false;
          console.log(
            'Productos en la orden encontrados: ',
            this.order.productos
          );
        },
      });
    });
  }

  // Getter para obtener la clase de la insignia de estado dinámicamente
  get estadoPagoClass() {
    return {
      'bg-green-100 text-green-800': this.order.estadoPago === 'pagado',
      'bg-red-100 text-red-800': this.order.estadoPago === 'cancelado',
      'bg-yellow-100 text-yellow-800': this.order.estadoPago === 'pendiente',
      'bg-slate-100 text-slate-800': this.order.estadoPago === 'no_pagado',
    };
  }
}
