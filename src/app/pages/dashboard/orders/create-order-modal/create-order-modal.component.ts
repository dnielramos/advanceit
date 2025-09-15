/*
================================================================
/src/app/components/orders/create-order-modal/create-order-modal.component.ts
================================================================
Lógica del componente actualizada para funcionar con el nuevo OrdersService.
*/
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { QuotationService } from '../../../../services/quotation.service';
import { ProductsService } from '../../../../services/product.service';
import { PopulatedQuotation, Quotation } from '../../../../models/quotation.types';
import { User } from '../../../../models/user';
import { Company } from '../../../../services/companies.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './create-order-modal.component.html',
})
export class CreateOrderModalComponent implements OnInit {

  @Input() order !: Order;
  isProcessing = false; // Estado para mostrar el modal de procesamiento
  @Output() close = new EventEmitter<void>();
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

  cotizacion : PopulatedQuotation | null = null;
  compania : Company | null = null;
  usuario : User | null = null;
  quotationToValidate: PopulatedQuotation | null = null;
  productsToValidate: { producto: ProductoFinal | null; cantidad_solicitada: number }[] = [];

  // --- Nuevos campos para el detalle del envío ---
  newOrderShippingAddress = '';
  newOrderEstimatedDeliveryTime: number | null = null;
  newOrderCarrier = '';
  newOrderTrackingNumber = '';

  // --- Campos para Validación ---
  isOrderValid = false;
  validationErrors: string[] = [];
  isSubmitting = false;

  constructor(private ordersService: OrdersService, private quotationService: QuotationService, private productsService: ProductsService) {}

  // --- Lógica para Procesar la Orden ---
  ngOnInit(): void {
    this.getQuotation();
  }

  getQuotation(): void {
    if (!this.order) return;

    this.quotationService.findOne(this.order.quotationId).subscribe({
      next: (quotation) => {
        this.quotationToValidate = quotation;
        console.log('Cotización asociada:', this.quotationToValidate);

        // Ahora, para cada detalle en la cotización, obtener el producto por id y conservar la cantidad del producto que dice en detalle
        if (this.quotationToValidate) {
          const productObservables = this.quotationToValidate.details.map(
            (detail) =>
              this.productsService.getProductById(detail.product_id)
          );

          // Suscribirse a todas las búsquedas de productos
          forkJoin(productObservables).subscribe({
            next: (products) => {
              this.productsToValidate = products.map((producto, index) => ({
                producto,
                cantidad_solicitada: this.quotationToValidate?.details[index].quantity || 0,
              }));

              console.log('Productos obtenidos para validar:', this.productsToValidate);
            },
            error: (err) => {
              console.error('Error al obtener productos:', err);
            },
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener la cotización:', err);
        this.isProcessing = false;
      },
    });
  }


      processOrder(order: Order): void {
      const confirmation = confirm(
        `¿Marcar la Orden #${order.numeroOrden} como "Pagada"?`
      );
      if (!confirmation) return;

      this.isProcessing = true; // Mostrar el modal de procesamiento

      console.log('Procesando orden:', order);

      this.quotationService.findOne(order.quotationId).subscribe({
        next: (quotation) => {
          this.quotationToValidate = quotation;
          console.log('Cotización asociada:', this.quotationToValidate);

          // Ahora, para cada detalle en la cotización, obtener el producto por id y conservar la cantidad del producto que dice en detalle
          if (this.quotationToValidate) {
            const productObservables = this.quotationToValidate.details.map(
              (detail) =>
                this.productsService.getProductById(detail.product_id)
            );

            // Suscribirse a todas las búsquedas de productos
            forkJoin(productObservables).subscribe({
              next: (products) => {
                this.productsToValidate = products.map((producto, index) => ({
                  producto,
                  cantidad_solicitada: this.quotationToValidate?.details[index].quantity || 0,
                }));

                console.log('Productos obtenidos para validar:', this.productsToValidate);
              },
              error: (err) => {
                console.error('Error al obtener productos:', err);
              },
            });
          }
        },
        error: (err) => {
          console.error('Error al obtener la cotización:', err);
          this.isProcessing = false;
        },
      });
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
    // const newOrderData: Omit<Order, 'id'> = {
    //   numeroOrden: this.generateOrderNumber(),
    //   fecha,
    //   hora,
    //   estadoPago: 'pendiente',
    //   precioTotal: this.calculateTotal(),
    //   // El método para obtener los SKUs sigue siendo válido
    //   // productos: this.newOrderProducts.map((product) => product.SKU),
    //   cliente: this.newOrderClient.trim(),
    //   shippingNo: `SH-${Math.floor(Math.random() * 1000)
    //     .toString()
    //     .padStart(3, '0')}`,
    //   notas: this.newOrderNote.trim(),
    // };

    // console.log('Nueva Orden:', newOrderData);
    // this.createOrder.emit(newOrderData);
    this.close.emit(); // Cierra el modal después de emitir
  }
  // --- Métodos Auxiliares ---
  private getCurrentDateTime(): { fecha: string; hora: string } {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const hora = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS
    return { fecha, hora };
  }
}
