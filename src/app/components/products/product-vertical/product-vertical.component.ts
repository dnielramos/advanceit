import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faCopyright,
  faShoppingCart,
  faEye,
  faLayerGroup,
  faTag,
  faCodeBranch,
} from '@fortawesome/free-solid-svg-icons';
import { ProductoFinal } from '../../../models/Productos';
import { RouterLink } from '@angular/router';
import { AuthService, Role } from '../../../services/auth.service';

@Component({
  selector: 'app-product-vertical',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './product-vertical.component.html',
})
export class ProductVerticalComponent {

  @Input() imagenIzquierda: boolean = true;
  @Input() productosFiltrados: ProductoFinal[] = [];
  @Input() producto!: ProductoFinal;
  @Output() agregarAlCarrito = new EventEmitter<ProductoFinal>();

  islogged: boolean = false;

  constructor(private authService: AuthService) {
    this.islogged = this.authService.hasRole(Role.User);
  }

  addToCart(producto: ProductoFinal) {
    this.agregarAlCarrito.emit(producto);
  }

  faShoppingCart = faShoppingCart;
  faEye = faEye;
  faSearch = faSearch;
  faLayerGroup = faLayerGroup;
  faTag = faTag;
  faCopririgth = faCopyright;
  faCodeBranch = faCodeBranch;
}
