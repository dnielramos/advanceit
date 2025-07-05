import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faCopyright, faShoppingCart, faEye, faLayerGroup, faTag, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { Producto } from '../../../models/Productos';
import { RouterLink } from '@angular/router';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';

@Component({
  selector: 'app-product-advance',
  imports: [CommonModule, FontAwesomeModule, SanitizeImageUrlPipe],
  templateUrl: './product-advance.component.html',
})
export class ProductAdvanceComponent {

  @Input() productosFiltrados: Producto[] = [];
  @Input() producto !: Producto;
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
