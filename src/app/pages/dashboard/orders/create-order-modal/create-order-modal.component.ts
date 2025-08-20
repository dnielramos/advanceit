/*
================================================================
/src/app/components/orders/create-order-modal/create-order-modal.component.ts
================================================================
Lógica del componente actualizada para funcionar con el nuevo OrdersService.
*/
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
// Se importan las interfaces actualizadas del servicio
import {
  OrdersService,
  Order,
} from '../../../../services/orders.service';
import { ProductoFinal } from '../../../../models/Productos';

@Component({
  selector: 'app-create-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './create-order-modal.component.html',
})
export class CreateOrderModalComponent {
  @Output() close = new EventEmitter<void>();
  // ACTUALIZADO: El tipo de la orden emitida ahora usa 'id' en lugar de '_id'
  @Output() createOrder = new EventEmitter<Omit<Order, 'id'>>();

  // --- Iconos ---
  faTimes = faTimes;

  // --- Estado interno del formulario ---
  newOrderClient = '';
  newOrderNote = '';
  newOrderProducts: ProductoFinal[] = [];
  newProductInput = '';
  productSearchResult: ProductoFinal | null = null;
  productSearchError = '';
  isSearching = false; // Añadido para feedback al usuario

  constructor(private ordersService: OrdersService) {}

  // --- Lógica de Búsqueda de Productos (SIMPLIFICADA) ---
  searchProduct(): void {
    this.productSearchResult = null;
    this.productSearchError = '';
    if (!this.newProductInput.trim()) {
      return;
    }

    this.isSearching = true;
    this.ordersService
      .searchProductBySku(this.newProductInput.trim())
      .subscribe({
        next: (product) => {
          // El servicio ahora devuelve el objeto Product directamente, no hay necesidad de mapear.
          console.log(product);
          this.productSearchResult = product;
          this.isSearching = false;
        },
        error: (err) => {
          // El servicio ya maneja el error, solo lo mostramos.
          this.productSearchError =
            'Producto no encontrado o error en la búsqueda.';
          this.isSearching = false;
          console.error(err);
        },
      });
  }

  addProductToOrder(product: ProductoFinal): void {
    // Evita añadir productos duplicados
    if (!this.newOrderProducts.some((p) => p.SKU === product.SKU)) {
      this.newOrderProducts.push(product);
    }
    this.newProductInput = '';
    this.productSearchResult = null;
    this.productSearchError = '';
  }

  removeProductFromOrder(index: number): void {
    this.newOrderProducts.splice(index, 1);
  }


  calculateTotal(): number {
    return this.newOrderProducts.reduce((acc, p) => acc + (p["price"] || 0), 0);
  }

  // --- Lógica para Crear y Emitir la Orden ---
  submitOrder(): void {
    if (!this.newOrderClient.trim() || this.newOrderProducts.length === 0) {
      alert('El nombre del cliente y al menos un producto son obligatorios.');
      return;
    }

    const { fecha, hora } = this.getCurrentDateTime();
    // ACTUALIZADO: El tipo de la nueva orden coincide con Omit<Order, 'id'>
    const newOrderData: Omit<Order, 'id'> = {
      numeroOrden: this.generateOrderNumber(),
      fecha,
      hora,
      estadoPago: 'pendiente',
      precioTotal: this.calculateTotal(),
      // El método para obtener los SKUs sigue siendo válido
      productos: this.newOrderProducts.map((product) => product.SKU),
      cliente: this.newOrderClient.trim(),
      shippingNo: `SH-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`,
      notas: this.newOrderNote.trim(),
    };

    console.log('Nueva Orden:', newOrderData);
    this.createOrder.emit(newOrderData);
    this.close.emit(); // Cierra el modal después de emitir
  }

  // --- Métodos Privados de Ayuda (SIN CAMBIOS) ---
  private generateOrderNumber(): string {
    return `SH-${Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0')}`;
  }

  private getCurrentDateTime(): { fecha: string; hora: string } {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const hora = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS
    return { fecha, hora };
  }
}
