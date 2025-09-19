/*
================================================================
/src/app/components/orders/create-order-modal/create-order-modal.component.ts
================================================================
Lógica del componente refactorizada para una mejor carga de datos, validación centralizada y una UI/UX mejorada.
*/
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faCreditCard,
  faBoxOpen,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// --- Interfaces (se asume que están en los archivos correspondientes) ---

// --- Servicios ---
import { Order, OrderProducts, OrdersService } from '../../../../services/orders.service';
import { QuotationService } from '../../../../services/quotation.service';
import { UsersService } from '../../../../services/users.service';
import { CompaniesService, Company } from '../../../../services/companies.service';
import { PopulatedQuotation, Quotation } from '../../../../models/quotation.types';
import { User } from '../../../../models/user';
import { CreateShippingDto } from '../../../../services/shippings.service';

// Interface para el evento de salida
export interface ProcessOrderPayload {
  orderId: string;
  shippingAddress: string;
  estimatedDeliveryDays: number | null;
  carrier: string;
  trackingNumber: string;
}

@Component({
  selector: 'app-create-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './create-order-modal.component.html',
})
export class CreateOrderModalComponent implements OnInit {
  @Input() order: Order | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() processOrder = new EventEmitter<CreateShippingDto>();

  // --- Iconos ---
  faTimes = faTimes;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;
  faCreditCard = faCreditCard;
  faBoxOpen = faBoxOpen;
  faUser = faUser;

  // --- Estado de Carga y UI ---
  isLoading = true;
  isSubmitting = false;
  loadingMessage = 'Cargando detalles de la orden...';

  // --- Datos para Validación ---
  quotation: PopulatedQuotation | null = null;
  company: Company | null = null;
  user: User | null = null;
  products: OrderProducts[] = [];

  // --- Estado de Validación ---
  isOrderValid = false;
  creditCheck = { valid: false, available: 0, remaining: 0 };
  stockCheckValid = false;
  formCheckValid = false;
  validationErrors: string[] = [];

  // --- Campos del Formulario de Envío ---
  shippingAddress = '';
  estimatedDeliveryDays: number | null = null;
  carrier = '';
  trackingNumber = '';

  constructor(
    private ordersService: OrdersService,
    private quotationService: QuotationService,
    private usersService: UsersService,
    private companyService: CompaniesService
  ) {}

  ngOnInit(): void {
    if (this.order) {
      this.loadOrderData();
    } else {
      this.isLoading = false;
      this.validationErrors.push('No se proporcionó una orden para procesar.');
    }
  }

  loadOrderData(): void {
    if (!this.order) return;

    // 1. Cargar productos de la orden
    this.ordersService.getOrderProducts(this.order.id).subscribe({
      next: (orderProducts) => {
        this.products = orderProducts;

        // 2. Cargar la cotización asociada
        this.quotationService.findOne(this.order!.quotationId).subscribe({
          next: (quotation) => {
            this.quotation = quotation;

            // 3. Cargar usuario y compañía en paralelo
            this.loadingMessage = 'Verificando cliente y crédito...';
            forkJoin({
              user: this.usersService.getUserById(quotation.user_id).pipe(catchError(() => of(null))),
              company: this.companyService.findById(quotation.company_id).pipe(catchError(() => of(null)))
            }).subscribe(({ user, company }) => {
                if (user) this.user = user;
                if (company) this.company = company;

                // 4. Una vez cargado todo, validar la orden
                this.validateOrder();
                this.isLoading = false;
            });
          },
          error: () => this.handleLoadError('No se pudo cargar la cotización asociada.'),
        });
      },
      error: () => this.handleLoadError('No se pudieron cargar los productos de la orden.'),
    });
  }

  private handleLoadError(message: string): void {
      this.validationErrors.push(message);
      this.isLoading = false;
  }

  validateOrder(): void {
    this.validationErrors = [];

    // --- Validación 1: Crédito de la Compañía ---
    if (this.company && this.order) {
      this.creditCheck.available = parseInt(this.company.saldo_credito) - parseInt(this.company.saldo_gastado);
      this.creditCheck.valid = this.creditCheck.available >= this.order.precioTotal;
      this.creditCheck.remaining = this.creditCheck.available - this.order.precioTotal;
      if (!this.creditCheck.valid) {
        this.validationErrors.push('Crédito insuficiente para cubrir el total de la orden.');
      }
    } else {
      this.creditCheck.valid = false;
      this.validationErrors.push('No se pudo verificar la información de crédito de la compañía.');
    }

    // --- Validación 2: Stock de Productos ---
    this.stockCheckValid = this.products.every(
      (p) => p.cantidad_solicitada <= (p.cantidad ?? 0)
    );
    if (!this.stockCheckValid) {
      this.validationErrors.push('Uno o más productos no tienen stock suficiente.');
    }

    // --- Validación 3: Formulario de Envío ---
    this.formCheckValid = this.shippingAddress.trim() !== '' && this.carrier.trim() !== '' && this.trackingNumber.trim() !== '';
    if (!this.formCheckValid) {
        this.validationErrors.push('La dirección, transportadora y número de guía son obligatorios.');
    }

    // --- Estado Final de Validación ---
    this.isOrderValid = this.creditCheck.valid && this.stockCheckValid && this.formCheckValid;
  }

  // Se llama cada vez que el formulario cambia para re-validar
  onFormChange(): void {
    this.validateOrder();
  }

  submitOrder(): void {
    this.validateOrder(); // Re-validar por si acaso
    if (!this.isOrderValid || !this.order) {
      alert('Por favor, corrige los errores antes de continuar.');
      return;
    }

    this.isSubmitting = true;

    const payload: ProcessOrderPayload = {
        orderId: this.order.id,
        carrier: this.carrier.trim(),
        trackingNumber: this.trackingNumber.trim(),
        estimatedDeliveryDays: this.estimatedDeliveryDays,
        shippingAddress: this.shippingAddress.trim(),
    };

    const shippingData: CreateShippingDto = {
      order_id: this.order.id,
      transportadora: this.carrier.trim(),
      guia: this.trackingNumber.trim(),
      fechaEstimada: this.estimatedDeliveryDays ? new Date(Date.now() + this.estimatedDeliveryDays * 86400000).toISOString().split('T')[0] : '',
      direccion_entrega: `Envío para la orden ${this.order.id}`
    };

    console.log('Procesando Orden:', shippingData);
    this.processOrder.emit(shippingData);

    // Simula una llamada a API y luego cierra
    setTimeout(() => {
        this.isSubmitting = false;
        this.close.emit();
    }, 1500);
  }
}
