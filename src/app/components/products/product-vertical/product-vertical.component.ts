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
import { Producto } from '../../../models/Productos';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-vertical',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './product-vertical.component.html',
})
export class ProductVerticalComponent {
  @Input() imagenIzquierda: boolean = true;
  @Input() productosFiltrados: Producto[] = [];
  @Input() producto!: Producto;
  @Output() agregarAlCarrito = new EventEmitter<Producto>();

  addToCart(producto: Producto) {
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
