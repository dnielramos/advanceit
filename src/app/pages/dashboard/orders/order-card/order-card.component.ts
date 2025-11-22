import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPen, faEye, faCheckSquare, faTrash, faCodeCompare, faShoppingCart, faDollarSign, faCalendarAlt, faReceipt, faUser, faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Order } from '../../../../services/orders.service';
import { AuthService, Role } from '../../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CompaniesService, Company } from '../../../../services/companies.service';
import { UsersService } from '../../../../services/users.service';
import { User } from '../../../../models/user';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NgClass],
templateUrl: './order-card.component.html',
})
export class OrderCardComponent implements OnInit, OnDestroy{
  @Input() order!: Order;
  @Output() markAsPaid = new EventEmitter<Order>();
  @Output() view = new EventEmitter<Order>();
  @Output() edit = new EventEmitter<Order>();
  @Output() delete = new EventEmitter<Order>();
  isLoggedIn: boolean = false;
  role: Role | null = null;
  Role = Role; // Hacer que la enumeración Role esté disponible en la plantilla
  private isLoggedInSubscription: any;
  private roleSubscription: any;

  user !: User;

  constructor(private authService: AuthService, private userService: UsersService) {
    this.isLoggedInSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.roleSubscription = this.authService.currentUserRole$.subscribe(role => {
      this.role = role;
    });
  }


  ngOnInit(): void {
     if(this.order){
       this.userService.getUserById(this.order.cliente).subscribe((user$)=>{
        this.user = user$;
       });
     }
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones si es necesario
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe();
    }
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  // Iconos
  faPen = faPen;
  faEye = faEye;
  faCheckSquare = faCheckSquare;
  faTrash = faTrash;
  faCodeCompare = faCodeCompare;
  faShoppingCart = faShoppingCart;
  faDollarSign = faDollarSign;
  faCalendarAlt = faCalendarAlt;
  faReceipt = faReceipt;
  faUser = faUser;
  faEdit = faEdit;
  faCheck = faCheck;

  get estadoPagoClass() {
    return {
      'bg-green-100 text-green-800': this.order.estadoPago === 'pagado',
      'bg-red-100 text-red-800': this.order.estadoPago === 'cancelado',
      'bg-yellow-100 text-yellow-800': this.order.estadoPago === 'pendiente',
      'bg-slate-100 text-slate-800': this.order.estadoPago === 'no_pagado',
    };
  }
}
