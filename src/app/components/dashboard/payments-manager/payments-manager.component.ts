import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faCashRegister, faCheck, faCircleNotch, faClock, faCreditCard, faExclamationTriangle, faEye, faFileInvoiceDollar, faHandHoldingUsd, faPlus, faTimes, faUpload, faUniversity, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';

// Tus modelos y servicios
import { PaymentsService } from '../../../services/payments.service';
import { Payment, PaymentStatus, PaymentMethod, CreatePaymentPayload } from '../../../models/payment.model';

// Tipos para los helpers de la UI
type StatusInfo = { [key in PaymentStatus]: { icon: IconDefinition; color: string; label: string } };
type MethodInfo = { [key in PaymentMethod]: { icon: IconDefinition; label: string } };
type ActionType = 'status' | 'date' | 'voucher';

@Component({
  selector: 'app-payments-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './payments-manager.component.html',
  styleUrls: ['./payments-manager.component.css']
})
export class PaymentsManagerComponent implements OnInit {
  private paymentsService = inject(PaymentsService);

  // Estado del componente
  public payments: Payment[] = [];
  public selectedPayment: Payment | null = null;
  public isLoading = true;
  public error: string | null = null;

  // Estado para el modal de Creación
  public isCreateModalOpen = false;
  public newPayment: CreatePaymentPayload = this.getInitialCreatePayload();

  // Estado para el modal de Acciones (Actualizar/Subir)
  public isActionModalOpen = false;
  public actionType: ActionType = 'status';
  public updateStatus: PaymentStatus = 'pendiente';
  public updateDate: string = new Date().toISOString().split('T')[0];
  public selectedFile: File | null = null;
  public isUploading = false;

  // Estado para el comprobante en Base64
  public voucherBase64: string | null = null;
  public showBase64Modal = false;

  // Estado para vista mobile
  public showDetailsMobile = false;

  // --- Iconos de FontAwesome ---
  faPlus = faPlus;
  faCircleNotch = faCircleNotch;
  faEye = faEye;
  faExclamationTriangle = faExclamationTriangle;
  faFileArrowUp = faFileArrowUp;
  faCashRegister = faCashRegister;
  faClock = faClock;
  faCheck = faCheck;
  faFileInvoiceDollar = faFileInvoiceDollar;

  // --- Helpers para la UI ---
  public readonly statusInfo: StatusInfo = {
    pendiente: { icon: faClock, color: 'text-orange-500', label: 'Pendiente' },
    pagado: { icon: faCheck, color: 'text-green-500', label: 'Pagado' },
    no_pagado: { icon: faTimes, color: 'text-red-500', label: 'No Pagado' },
    atrasado: { icon: faExclamationTriangle, color: 'text-yellow-600', label: 'Atrasado' },
  };
  public readonly methodInfo: MethodInfo = {
    transferencia: { icon: faUniversity, label: 'Transferencia' },
    tarjeta: { icon: faCreditCard, label: 'Tarjeta' },
    credito: { icon: faHandHoldingUsd, label: 'Crédito' },
  };

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.error = null;
    this.paymentsService.getAllPayments()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.payments = data;
          this.updateSelectedPayment();
        },
        error: (err) => this.error = 'No se pudieron cargar los pagos.',
      });
  }

  selectPayment(payment: Payment): void {
    this.selectedPayment = payment;
    this.showDetailsMobile = true;
  }

  closeDetailsMobile(): void {
    this.showDetailsMobile = false;
  }

  // --- Lógica del Modal de Creación ---
  openCreateModal(): void {
    this.newPayment = this.getInitialCreatePayload();
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  handleCreateSubmit(): void {
    this.paymentsService.createPayment(this.newPayment).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadPayments();
      },
      error: (err) => alert('Error al crear el pago.'),
    });
  }

  // --- Lógica del Modal de Acciones ---
  openActionModal(type: ActionType): void {
    if (!this.selectedPayment) return;
    this.actionType = type;
    // Pre-populamos los valores del modal
    this.updateStatus = this.selectedPayment.estado;
    this.updateDate = this.selectedPayment.fechaPago || new Date().toISOString().split('T')[0];
    this.selectedFile = null;
    this.voucherBase64 = null;
    this.isActionModalOpen = true;
  }

  closeActionModal(): void {
    this.isActionModalOpen = false;
    this.selectedFile = null;
    this.voucherBase64 = null;
  }

  handleStatusUpdate(): void {
    if (!this.selectedPayment) return;

    // Si está cambiando a "pagado", solicitar comprobante
    if (this.updateStatus === 'pagado' && this.selectedPayment.estado !== 'pagado') {
      this.closeActionModal();
      this.openActionModal('voucher');
      return;
    }

    this.paymentsService.updatePaymentStatus(this.selectedPayment.id, { estado: this.updateStatus })
      .subscribe(() => {
        this.loadPayments();
        this.closeActionModal();
      });
  }

  handleDateUpdate(): void {
    if (!this.selectedPayment) return;
    this.paymentsService.updatePaymentDate(this.selectedPayment.id, { fechaPago: this.updateDate })
      .subscribe(() => {
        this.loadPayments();
        this.closeActionModal();
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Convertir a Base64 inmediatamente
      this.convertFileToBase64(input.files[0]);
    }
  }

  convertFileToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.voucherBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  handleVoucherUpload(): void {
    if (!this.selectedPayment || !this.selectedFile || !this.voucherBase64) return;

    this.isUploading = true;
    this.paymentsService.uploadVoucher(this.selectedPayment.id, this.selectedFile)
      .pipe(finalize(() => this.isUploading = false))
      .subscribe({
        next: () => {
          // Mostrar el Base64 antes de actualizar
          this.showBase64Result();

          // Actualizar estado a pagado y fecha si no lo están
          if (this.selectedPayment?.estado !== 'pagado') {
            this.paymentsService.updatePaymentStatus(this.selectedPayment!.id, { estado: 'pagado' })
              .subscribe(() => {
                const today = new Date().toISOString().split('T')[0];
                this.paymentsService.updatePaymentDate(this.selectedPayment!.id, { fechaPago: today })
                  .subscribe(() => {
                    this.loadPayments();
                    this.closeActionModal();
                  });
              });
          } else {
            this.loadPayments();
            this.closeActionModal();
          }
        },
        error: (err) => {
          alert('Error al subir el comprobante.');
          this.isUploading = false;
        },
      });
  }

  showBase64Result(): void {
    this.showBase64Modal = true;
  }

  closeBase64Modal(): void {
    this.showBase64Modal = false;
  }

  copyBase64ToClipboard(): void {
    if (this.voucherBase64) {
      navigator.clipboard.writeText(this.voucherBase64).then(() => {
        alert('Base64 copiado al portapapeles!');
      });
    }
  }

  // --- Métodos de Ayuda ---
  private getInitialCreatePayload(): CreatePaymentPayload {
    return {
      order_id: '',
      monto: 0,
      fechaLimitePago: new Date().toISOString().split('T')[0],
      metodo: 'transferencia',
    };
  }

  private updateSelectedPayment(): void {
    if (this.selectedPayment) {
      this.selectedPayment = this.payments.find(p => p.id === this.selectedPayment?.id) || null;
    }
  }
}
