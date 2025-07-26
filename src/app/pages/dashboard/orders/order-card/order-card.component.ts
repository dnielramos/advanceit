import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faEye, faCheckSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Order } from '../../../../services/orders.service';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NgClass],
  templateUrl: './order-card.component.html',
})
export class OrderCardComponent {
  @Input() order!: Order;
  @Output() markAsPaid = new EventEmitter<Order>();
  @Output() view = new EventEmitter<Order>();
  @Output() edit = new EventEmitter<Order>();
  @Output() delete = new EventEmitter<Order>();

  // Iconos
  faPen = faPen;
  faEye = faEye;
  faCheckSquare = faCheckSquare;
  faTrash = faTrash;

  get estadoPagoClass() {
    return {
      'bg-green-100 text-green-800': this.order.estadoPago === 'pagado',
      'bg-red-100 text-red-800': this.order.estadoPago === 'cancelado',
      'bg-yellow-100 text-yellow-800': this.order.estadoPago === 'pendiente',
      'bg-slate-100 text-slate-800': this.order.estadoPago === 'no_pagado',
    };
  }
}
