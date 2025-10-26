import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faCircleNotch,
  faEdit,
  faExclamationTriangle,
  faEye,
  faImage,
  faPlus,
  faSpinner,
  faTimesCircle,
  faTruck,
  faWarehouse,
  faArrowLeft,
  faTimes, // Importar ícono para cerrar el modal
} from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';
import { ShippingsService } from '../../../services/shippings.service';
import {
  Shipping,
  ShippingStatus,
  UpdateStatusPayload,
} from '../../../models/shipping.model';
import { UpdateStatusModalComponent } from './update-status-modal/update-status-modal.component';
import { FilterData } from '../../../pages/dashboard/orders/order-filter/order-filter.component';
import { ShippingViewerComponent } from "./shipping-viewer/shipping-viewer.component";
import { HeaderCrudComponent } from '../../../shared/header-dashboard/heeader-crud.component';

@Component({
  selector: 'app-shippings-manager',
  standalone: true,
  imports: [
    CommonModule,
    HeaderCrudComponent,
    FormsModule,
    FontAwesomeModule,
    UpdateStatusModalComponent,
    ShippingViewerComponent
],
  templateUrl: './shippings-manager.component.html',
})
export class ShippingsManagerComponent implements OnInit {
  private shippingsService = inject(ShippingsService);

  public allShippings: Shipping[] = [];
  public shippings: Shipping[] = [];
  public selectedShipping: Shipping | null = null;
  public idShippingToView: string = '';

  public isLoading = true;
  public error: string | null = null;

  // --- NUEVA LÓGICA PARA MODAL MÓVIL ---
  public isMobile = false;
  public isDetailsModalOpen = false;
  // --- FIN NUEVA LÓGICA ---

  public isUpdateStatusModalOpen = false;
  public isSubmitting = false;
  public updateStatusPayload: any = this.getInitialUpdateStatusPayload();
  public readonly availableStatuses: Exclude<ShippingStatus, 'preparando'>[] = [
    'en_transito',
    'entregado',
    'fallido',
  ];
  public guiaImagePreview: string | null = null;
  public fileError: string | null = null;

  filters = {
    texto: '',
    estado: '',
  };

  // Íconos
  faPlus = faPlus;
  faCircleNotch = faCircleNotch;
  faEye = faEye;
  faExclamationTriangle = faExclamationTriangle;
  faEdit = faEdit;
  faImage = faImage;
  faSpinner = faSpinner;
  faTruck = faTruck;
  faArrowLeft = faArrowLeft;
  faTimes = faTimes; // Ícono de cierre

  public readonly statusInfo: {
    [key in ShippingStatus]: {
      icon: any;
      color: string;
      label: string;
    };
  } = {
    preparando: {
      icon: faWarehouse,
      color: 'text-yellow-500',
      label: 'Preparando',
    },
    en_transito: {
      icon: faTruck,
      color: 'text-blue-500',
      label: 'En Tránsito',
    },
    entregado: {
      icon: faCheckCircle,
      color: 'text-green-500',
      label: 'Entregado',
    },
    fallido: { icon: faTimesCircle, color: 'text-red-500', label: 'Fallido' },
  };

  ngOnInit(): void {
    this.checkScreenSize(); // Comprobar tamaño al iniciar
    this.loadShippings();
  }

  // --- NUEVOS MÉTODOS PARA RESPONSIVE ---
  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 1024; // 1024px es el breakpoint 'lg' de Tailwind
  }
  // --- FIN NUEVOS MÉTODOS ---

  loadShippings(): void {
    this.isLoading = true;
    this.error = null;
    this.shippingsService
      .getAllShippings()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          const sorted = data.sort(
            (a, b) =>
              new Date(b.fechaEstimada || 0).getTime() -
              new Date(a.fechaEstimada || 0).getTime()
          );
          this.allShippings = sorted;
          this.shippings = [...this.allShippings];

          if (this.selectedShipping) {
            this.selectedShipping =
              this.shippings.find((s) => s.id === this.selectedShipping?.id) ||
              null;
          }
        },
        error: (err) => {
          this.error = 'No se pudieron cargar los envíos.';
          console.error(err);
        },
      });
  }

  handleFilterChange(newFilters: FilterData): void {
    this.filters = { ...this.filters, ...newFilters };
    this.applyFilters();
  }

  handleClearFilters(): void {
    this.filters = { texto: '', estado: '' };
    this.applyFilters();
  }

  applyFilters(): void {
    const texto = this.filters.texto.toLowerCase();
    const estado = this.filters.estado;

    this.shippings = this.allShippings.filter((shipping) => {
      const matchEstado = estado ? shipping.estado === estado : true;
      // MEJORA: Buscar también por guía y transportadora
      const matchTexto = texto
        ? shipping.order_id.toLowerCase().includes(texto) ||
          shipping.guia?.toLowerCase().includes(texto) ||
          shipping.transportadora?.toLowerCase().includes(texto)
        : true;
      return matchEstado && matchTexto;
    });
  }

  // --- MÉTODO `selectShipping` ACTUALIZADO ---
  selectShipping(shipping: Shipping): void {
    this.selectedShipping = shipping;
    if (this.isMobile) {
      this.isDetailsModalOpen = true; // Abrir modal en móvil
    }
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
  }
  // --- FIN ACTUALIZACIÓN ---

  openUpdateStatusModal(): void {
    if (!this.selectedShipping) return;
    this.updateStatusPayload = this.getInitialUpdateStatusPayload();
    this.guiaImagePreview = null;
    this.fileError = null;
    this.isUpdateStatusModalOpen = true;
  }

  closeUpdateStatusModal(): void {
    this.isUpdateStatusModalOpen = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.guiaImagePreview = null;
      this.updateStatusPayload.comprobanteGuiaBase64 = null;
      this.fileError = null;
      return;
    }

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      this.fileError = 'El archivo es muy grande (máx 5MB).';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.guiaImagePreview = reader.result as string;
      this.updateStatusPayload.comprobanteGuiaBase64 = reader.result as string;
      this.fileError = null;
    };
    reader.onerror = () => {
      this.fileError = 'No se pudo leer el archivo.';
    };
    reader.readAsDataURL(file);
  }

  handleUpdateStatusSubmit(form: NgForm): void {

    if(this.isSubmitting) return;
    // 1. Validaciones iniciales (estas se mantienen igual)
    if (form.invalid) {
      Object.values(form.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }
    if (!this.selectedShipping) {
      console.error('No hay un envío seleccionado.');
      return;
    }
    if (
      this.updateStatusPayload.estado === 'en_transito' &&
      !this.updateStatusPayload.comprobanteGuiaBase64
    ) {
      this.fileError =
        'La foto del comprobante es obligatoria para el estado "En Tránsito".';
      return;
    }

    this.isSubmitting = true;

    // 2. Construir un ÚNICO payload dinámicamente
    // Todos los casos necesitan el estado y la descripción.
    const finalPayload: any = {
      estado: this.updateStatusPayload.estado,
      description: this.updateStatusPayload.description,
    };

    // Si el estado es 'en_transito', agregamos los campos adicionales.
    // El backend sabrá qué hacer con ellos.
    if (this.updateStatusPayload.estado === 'en_transito') {
      finalPayload.guia = this.updateStatusPayload.guia;
      finalPayload.transportadora = this.updateStatusPayload.transportadora;
      finalPayload.fechaEstimada = this.updateStatusPayload.fechaEstimada;
      finalPayload.direccionEntrega = this.updateStatusPayload.direccionEntrega;
      finalPayload.comprobanteGuiaBase64 =
        this.updateStatusPayload.comprobanteGuiaBase64;
    }

    // 3. Llamar al servicio UNA SOLA VEZ con el payload construido
    this.shippingsService
      .updateShipping(this.selectedShipping.id, finalPayload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          alert('¡El envío se ha actualizado correctamente!');
          this.closeUpdateStatusModal();
          this.loadShippings();
          if (this.isMobile) {
            this.closeDetailsModal();
          }
        },
        error: (err) => {
          // Mejoramos el mensaje de error para que muestre el error del backend
          const errorMessage =
            err?.error?.message || 'Ocurrió un error inesperado.';
          alert(`Error al actualizar el envío: ${errorMessage}`);
          console.error(err);
        },
      });
  }

  private getInitialUpdateStatusPayload(): any {
    const today = new Date().toISOString().split('T')[0];
    return {
      estado: null,
      description: '',
      comprobanteGuiaBase64: null,
      guia: this.selectedShipping?.guia || '',
      transportadora: this.selectedShipping?.transportadora || '',
      fechaEstimada: today,
      direccionEntrega: '',
    };
  }

  getStatusInfo(status: ShippingStatus) {
    return this.statusInfo[status];
  }


  public setShippingToView(id: string) {
    this.idShippingToView = id;
  }

  public closeShippingViewer() {
    this.idShippingToView = '';
  }

}

