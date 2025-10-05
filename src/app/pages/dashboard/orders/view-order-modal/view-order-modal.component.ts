import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { OrdersService, Order } from '../../../../services/orders.service';
import { ProductoFinal } from '../../../../models/Productos';
import { ProductsService } from '../../../../services/product.service';
import { UsersService } from '../../../../services/users.service';
import { User } from '../../../../models/user';

@Component({
  selector: 'app-view-order-modal',
  standalone: true,
  imports: [CommonModule, NgClass, FontAwesomeModule],
  templateUrl: './view-order-modal.component.html',
})
export class ViewOrderModalComponent implements OnInit {
  @Input() order!: Order;
  @Output() close = new EventEmitter<void>();

  //usuario activo
  user !: User;

  // --- Iconos ---
  faTimes = faTimes;

  // --- Estado Local ---
  orderProducts: (ProductoFinal & { cantidad_solicitada: number })[] = [];
  totalOrderQuantity = 0;
  isLoading = true;

  constructor(
    private ordersService: OrdersService,
    private userService: UsersService,
    private productsService: ProductsService
  ) {}

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

    this.ordersService.getOrderProducts(this.order.id).subscribe({
      next: (orderProductsResponse) => {
        console.log('Productos en la orden :', this.order.id, ' RESPONSE?>' , orderProductsResponse);
        if (
          orderProductsResponse
        ) {
          this.orderProducts = orderProductsResponse;
          this.totalOrderQuantity = this.orderProducts.reduce(
            (sum, item) => sum + item.cantidad_solicitada,
            0
          );
        }
      },
      error: (err) => {
        console.error('Error cargando el producto:', err);
      },
      complete: () => {
        this.isLoading = false;
        console.log('Productos en la orden encontrados: ', this.orderProducts);
      },
    });

    this.userService.getUserById(this.order.cliente).subscribe((user$)=>{
      this.user = user$;
    })

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
