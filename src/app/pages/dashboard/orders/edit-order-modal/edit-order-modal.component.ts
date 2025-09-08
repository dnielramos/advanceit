import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { OrdersService, Order } from '../../../../services/orders.service';
import { ProductoFinal } from '../../../../models/Productos';

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
  orderProducts: ProductoFinal[] = [];

  // Para la búsqueda de nuevos productos
  newProductInput = '';
  productSearchResult: ProductoFinal | null = null;
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

    this.ordersService.getOrderProducts(this.editableOrder.id).subscribe({
      next: (response) => {
        console.log('Respuesta cruda de la API:', response);

        // Si la API trae 'return' como propiedad con los productos
        this.orderProducts = Array.isArray(response) ? response : [];

        console.log('Productos en la orden procesados:', this.orderProducts);

        this.isLoadingProducts = false;
        this.recalculateTotal(); // Recalcular total
      },
      error: (err) => {
        console.error('Error cargando detalles de productos', err);
        this.isLoadingProducts = false;
        this.orderProducts = [];
      },
    });
  }

  recalculateTotal(): void {
    this.editableOrder.precioTotal = this.orderProducts.reduce(
      (acc, p) => acc + (p['price'] || 0),
      0
    );
  }

  // --- Lógica de Productos (similar al modal de creación) ---
  searchProduct(): void {
    // ... (La lógica es idéntica al CreateOrderModalComponent)
  }

  addProductToOrder(product: ProductoFinal): void {
    // Evitar duplicados
    if (!this.orderProducts.some((p) => p.SKU === product.SKU)) {
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
    // this.editableOrder.productos = this.orderProducts.map((p) => p.SKU);

    // // Emitir la orden completamente actualizada
    // this.save.emit(this.editableOrder);
  }
}
