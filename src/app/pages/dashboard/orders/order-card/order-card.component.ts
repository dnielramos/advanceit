import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faEye, faCheckSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Order } from '../../../../services/orders.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NgClass],
  templateUrl: './order-card.component.html',
})
export class OrderCardComponent implements OnDestroy{
  @Input() order!: Order;
  @Output() markAsPaid = new EventEmitter<Order>();
  @Output() view = new EventEmitter<Order>();
  @Output() edit = new EventEmitter<Order>();
  @Output() delete = new EventEmitter<Order>();
  isLoggedIn: boolean = false;
  private isLoggedInSubscription: any;

  constructor(private authService: AuthService) {
    this.isLoggedInSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones si es necesario
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe();
    }
  }

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
