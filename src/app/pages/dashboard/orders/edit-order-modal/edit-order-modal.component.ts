import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { OrdersService, Order, Product } from '../../../../services/orders.service';
import { NexsysProduct } from '../../../../models/Productos';

@Component({
  selector: 'app-edit-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './edit-order-modal.component.html',
})
export class EditOrderModalComponent implements OnInit {
  // Recibe la orden completa para editar
  @Input() order!: Order;

  // Emite la orden actualizada o el evento de cierre
  @Output() save = new EventEmitter<Order>();
  @Output() close = new EventEmitter<void>();

  // --- Iconos ---
  faTimes = faTimes;

  // --- Estado Local ---
  // Hacemos una copia para editarla sin afectar el objeto original hasta guardar
  editableOrder!: Order;
  // La lista de productos es más compleja, la manejaremos por separado
  orderProducts: Product[] = [];

  // Para la búsqueda de nuevos productos
  newProductInput = '';
  productSearchResult: Product | null = null;
  productSearchError = '';

  isLoadingProducts = true; // Indicador para la carga inicial de productos

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    // 1. Clonar la orden para evitar mutaciones no deseadas
    this.editableOrder = JSON.parse(JSON.stringify(this.order));

    // 2. Cargar los detalles completos de los productos basados en los SKUs
    this.loadProductDetails();
  }

  loadProductDetails(): void {
    this.isLoadingProducts = true;
    // Asumimos que el servicio puede buscar múltiples productos.
    // Aquí usamos un método simulado `getProductsBySkus` que deberías implementar.
    // this.ordersService.getProductsBySkus(this.editableOrder.productos).subscribe({
    //   next: (products) => {
    //     this.orderProducts = products;
    //     this.isLoadingProducts = false;
    //     this.recalculateTotal(); // Recalcular total con los productos cargados
    //   },
    //   error: (err) => {
    //     console.error("Error cargando detalles de productos", err);
    //     this.isLoadingProducts = false;
    //   }
    // });
  }

  recalculateTotal(): void {
    this.editableOrder.precioTotal = this.orderProducts.reduce((acc, p) => acc + (p.precio || 0), 0);
  }

  // --- Lógica de Productos (similar al modal de creación) ---
  searchProduct(): void {
    // ... (La lógica es idéntica al CreateOrderModalComponent)
  }

  addProductToOrder(product: Product): void {
    // Evitar duplicados
    if (!this.orderProducts.some(p => p.sku === product.sku)) {
      this.orderProducts.push(product);
      this.recalculateTotal();
    }
    this.newProductInput = '';
    this.productSearchResult = null;
  }

  removeProductFromOrder(index: number): void {
    this.orderProducts.splice(index, 1);
    this.recalculateTotal();
  }

  // --- Acción Final ---
  submitSaveChanges(): void {
    // Actualizar el array de SKUs en la orden a guardar
    this.editableOrder.productos = this.orderProducts.map(p => p.sku);

    // Emitir la orden completamente actualizada
    this.save.emit(this.editableOrder);
  }

  // Métodos de ayuda (pueden ser idénticos al otro modal)
  private mapNexsysProductToProduct(nexsysProduct: NexsysProduct): Product {
    // ...
    return {
      nombre: nexsysProduct.name,
      sku: nexsysProduct.sku,
      precio: nexsysProduct.price,
      // ... resto de propiedades
    } as Product;
  }
}
