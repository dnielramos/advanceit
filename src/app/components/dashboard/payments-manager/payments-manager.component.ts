import { Component, OnInit, inject, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  IconDefinition, 
  faCashRegister, 
  faCheck, 
  faCircleNotch, 
  faClock, 
  faCreditCard, 
  faExclamationTriangle, 
  faEye, 
  faFileInvoiceDollar, 
  faHandHoldingUsd, 
  faPlus, 
  faTimes, 
  faUpload, 
  faUniversity, 
  faFileArrowUp,
  faBuilding,
  faUser,
  faCalendarAlt,
  faMoneyBillWave,
  faEdit,
  faShieldAlt,
  faDownload,
  faExchangeAlt,
  faTimesCircle,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';

// Tus modelos y servicios
import { PaymentsService } from '../../../services/payments.service';
import { AuthService } from '../../../services/auth.service';
import { Payment, PaymentStatus, PaymentMethod, CreatePaymentPayload, getAuditUserName, AuditUser } from '../../../models/payment.model';
import { PaymentVoucherComponent } from "./payment-voucher/payment-voucher.component";
import { HeaderCrudComponent } from "../../../shared/header-dashboard/heeader-crud.component";

// Tipos para los helpers de la UI
type StatusInfo = { [key in PaymentStatus]: { icon: IconDefinition; color: string; label: string } };
type MethodInfo = { [key in PaymentMethod]: { icon: IconDefinition; label: string } };
type ActionType = 'status' | 'date' | 'voucher';

@Component({
  selector: 'app-payments-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, PaymentVoucherComponent, HeaderCrudComponent],
  templateUrl: './payments-manager.component.html',
  styleUrls: ['./payments-manager.component.css']
})
export class PaymentsManagerComponent implements OnInit {

  private paymentsService = inject(PaymentsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Estado del componente
  public allPayments: Payment[] = [];
  public payments: Payment[] = [];
  public selectedPayment: Payment | null = null;
  public isLoading = true;
  public error: string | null = null;
  
  // Para restaurar el pago seleccionado al regresar
  private pendingPaymentId: string | null = null;

  // Control de visitados para badge "Nuevo"
  private visitedPaymentIds = new Set<string>();

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

  public voucherModal = false;
  public isChangingVoucher = false; // Para cambiar comprobante desde el panel

  // Estado para vista mobile
  public showDetailsMobile = false;

  // Referencia al componente voucher para acceder a sus métodos
  @ViewChild('voucherComponent') voucherComponent?: PaymentVoucherComponent;

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
  faDownload = faDownload;
  faExchangeAlt = faExchangeAlt;
  faTimesCircle = faTimesCircle;
  faExternalLinkAlt = faExternalLinkAlt;

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
    // Verificar si hay un pago pendiente de seleccionar (regreso desde cotización)
    this.route.queryParams.subscribe(params => {
      if (params['paymentId']) {
        this.pendingPaymentId = params['paymentId'];
        // Limpiar el query param de la URL sin recargar
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.error = null;
    this.paymentsService.getAllPayments()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          // Ordenar por fecha de creación (más recientes primero)
          const sorted = data.sort(
            (a, b) =>
              new Date(b.created_at || b.fechaLimitePago || 0).getTime() -
              new Date(a.created_at || a.fechaLimitePago || 0).getTime()
          );
          this.allPayments = sorted;
          this.payments = [...this.allPayments];
          
          // Restaurar pago seleccionado si viene de navegación
          if (this.pendingPaymentId) {
            const payment = this.payments.find(p => p.id === this.pendingPaymentId);
            if (payment) {
              this.selectPayment(payment);
            }
            this.pendingPaymentId = null;
          } else {
            this.updateSelectedPayment();
          }
        },
        error: (err) => this.error = 'No se pudieron cargar los pagos.',
      });
  }


  // --- Lógica de Filtros ---
  handleFilterChange(filter: { texto: string; estado: string }): void {
    const texto = filter.texto.toLowerCase().trim();
    const estado = filter.estado;

    this.payments = this.allPayments.filter((payment) => {
      const matchEstado = estado ? payment.estado === estado : true;
      
      // Búsqueda mejorada: incluye orden, empresa, cliente, monto
      const matchTexto = texto
        ? payment.order_id?.toLowerCase().includes(texto) ||
          payment.order?.numeroOrden?.toLowerCase().includes(texto) ||
          payment.order?.company?.razon_social?.toLowerCase().includes(texto) ||
          payment.order?.company?.nit?.toLowerCase().includes(texto) ||
          payment.order?.user?.name?.toLowerCase().includes(texto) ||
          payment.monto.toString().includes(texto)
        : true;
        
      return matchEstado && matchTexto;
    });
  }

  handleClearFilters(): void {
    this.loadPayments();
  }


  selectPayment(payment: Payment): void {
    this.selectedPayment = payment;
    this.visitedPaymentIds.add(payment.id);
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

    const userId = this.authService.getUserId() || '';
    this.paymentsService.updatePaymentStatus(this.selectedPayment.id, { estado: this.updateStatus, user_id: userId })
      .subscribe(() => {
        this.loadPayments();
        this.closeActionModal();
      });
  }

  handleDateUpdate(): void {
    if (!this.selectedPayment) return;
    const userId = this.authService.getUserId() || '';
    this.paymentsService.updatePaymentDate(this.selectedPayment.id, { fechaPago: this.updateDate, user_id: userId })
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

    const userId = this.authService.getUserId() || '';
    this.isUploading = true;
    this.paymentsService.uploadVoucher(this.selectedPayment.id, this.selectedFile, userId)
      .pipe(finalize(() => this.isUploading = false))
      .subscribe({
        next: () => {
          // Mostrar el Base64 antes de actualizar
          this.showBase64Result();

          // Actualizar estado a pagado y fecha si no lo están
          if (this.selectedPayment?.estado !== 'pagado') {
            this.paymentsService.updatePaymentStatus(this.selectedPayment!.id, { estado: 'pagado', user_id: userId })
              .subscribe(() => {
                const today = new Date().toISOString().split('T')[0];
                this.paymentsService.updatePaymentDate(this.selectedPayment!.id, { fechaPago: today, user_id: userId })
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


  showVoucherModal(): void {
    this.voucherModal = true;
    this.isChangingVoucher = false;
    this.selectedFile = null;
  }

  closeVoucherModal(): void {
    this.voucherModal = false;
    this.isChangingVoucher = false;
    this.selectedFile = null;
  }

  /** Descarga el comprobante actual */
  downloadVoucher(): void {
    if (!this.voucherComponent?.comprobanteBase64) return;
    
    const base64 = this.voucherComponent.comprobanteBase64;
    const link = document.createElement('a');
    link.href = base64;
    
    // Determinar extensión
    const isPdf = base64.startsWith('data:application/pdf');
    const extension = isPdf ? 'pdf' : 'png';
    const orderNum = this.selectedPayment?.order?.numeroOrden || this.selectedPayment?.id || 'comprobante';
    link.download = `comprobante_${orderNum}.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /** Activa el modo de cambio de comprobante */
  startChangeVoucher(): void {
    this.isChangingVoucher = true;
    this.selectedFile = null;
  }

  /** Cancela el cambio de comprobante */
  cancelChangeVoucher(): void {
    this.isChangingVoucher = false;
    this.selectedFile = null;
  }

  /** Sube el nuevo comprobante desde el panel lateral */
  uploadNewVoucher(): void {
    if (!this.selectedPayment || !this.selectedFile) return;

    const userId = this.authService.getUserId();
    if (!userId) {
      alert('Error: No se pudo identificar al usuario.');
      return;
    }

    const paymentId = this.selectedPayment.id;
    this.isUploading = true;
    
    this.paymentsService.uploadVoucher(paymentId, this.selectedFile, userId)
      .pipe(finalize(() => this.isUploading = false))
      .subscribe({
        next: (updatedPayment) => {
          // Actualizar el pago seleccionado con los nuevos datos
          this.selectedPayment = updatedPayment;
          
          // Limpiar estado de cambio de comprobante
          this.isChangingVoucher = false;
          this.selectedFile = null;
          
          // Refrescar el componente voucher PRIMERO para mostrar el nuevo comprobante
          this.voucherComponent?.refresh();
          
          // Actualizar la lista de pagos en segundo plano sin afectar el modal
          this.refreshPaymentsListSilently(paymentId);
        },
        error: (err) => {
          alert('Error al subir el nuevo comprobante.');
        },
      });
  }

  /**
   * Actualiza la lista de pagos en segundo plano sin cerrar modales ni perder el estado actual.
   * Mantiene el pago seleccionado y el modal de comprobante abierto.
   */
  private refreshPaymentsListSilently(selectedPaymentId: string): void {
    this.paymentsService.getAllPayments().subscribe({
      next: (data) => {
        // Ordenar por fecha de creación (más recientes primero)
        const sorted = data.sort(
          (a, b) =>
            new Date(b.created_at || b.fechaLimitePago || 0).getTime() -
            new Date(a.created_at || a.fechaLimitePago || 0).getTime()
        );
        this.allPayments = sorted;
        this.payments = [...this.allPayments];
        
        // Actualizar el pago seleccionado con los datos más recientes de la lista
        const updatedPayment = this.payments.find(p => p.id === selectedPaymentId);
        if (updatedPayment) {
          this.selectedPayment = updatedPayment;
        }
      },
      error: () => {
        // Silenciar errores de actualización en segundo plano
      },
    });
  }

  /** Selecciona archivo para cambiar el comprobante */
  onChangeVoucherFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
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
      user_id: this.authService.getUserId() || '',
    };
  }

  private updateSelectedPayment(): void {
    if (this.selectedPayment) {
      this.selectedPayment = this.payments.find(p => p.id === this.selectedPayment?.id) || null;
    }
  }

  /**
   * Verifica si un pago es "nuevo" (creado hace menos de 1 hora y no visitado)
   */
  isNewPayment(payment: Payment): boolean {
    if (!payment.created_at) {
      return false;
    }
    const createdAt = new Date(payment.created_at).getTime();
    if (isNaN(createdAt)) {
      return false;
    }
    const oneHourInMs = 60 * 60 * 1000;
    const diffMs = Date.now() - createdAt;
    if (diffMs > oneHourInMs) {
      return false;
    }
    return !this.visitedPaymentIds.has(payment.id);
  }

  /**
   * Obtiene el nombre del usuario de auditoría (created_by, updated_by)
   */
  getAuditUserName(user: AuditUser | string | undefined | null): string {
    return getAuditUserName(user);
  }

  /**
   * Navega a la cotización asociada al pago seleccionado
   */
  navigateToQuotation(): void {
    if (!this.selectedPayment?.order?.quotation_id) {
      alert('Este pago no tiene una cotización asociada.');
      return;
    }

    const quotationId = this.selectedPayment.order.quotation_id;
    const paymentId = this.selectedPayment.id;

    // Navegar a cotización pasando el paymentId para regresar
    this.router.navigate(['/dashboard/cotizaciones', quotationId], {
      queryParams: { returnTo: 'payments', paymentId: paymentId }
    });
  }

  /**
   * Verifica si el pago tiene cotización asociada
   */
  hasQuotation(): boolean {
    return !!this.selectedPayment?.order?.quotation_id;
  }
}
