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
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';

@Component({
  selector: 'app-product-vertical',
  imports: [CommonModule, FontAwesomeModule, SanitizeImageUrlPipe],
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

  /**
   * ESTE ES EL GETTER DE LA SOLUCIÓN
   * Se asegura de que las etiquetas siempre sean un array iterable.
   */
  get safeEtiquetas(): string[] {
    const etiquetas = this.producto.etiquetas;

    // Caso 1: Los datos vienen como un string que parece un array (el error actual)
    if (typeof etiquetas === 'string') {
      try {
        const parsed = JSON.parse(etiquetas);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Si no se puede parsear, devolvemos un array vacío para no romper la app
        return [];
      }
    }

    // Caso 2: Los datos vienen correctamente como un array (o son nulos/indefinidos)
    return Array.isArray(etiquetas) ? etiquetas : [];
  }

  faShoppingCart = faShoppingCart;
  faEye = faEye;
  faSearch = faSearch;
  faLayerGroup = faLayerGroup;
  faTag = faTag;
  faCopririgth = faCopyright;
  faCodeBranch = faCodeBranch;
}
