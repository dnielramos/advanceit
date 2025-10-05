import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  IconDefinition,
  faCheckCircle, faCircleNotch, faEdit, faExclamationTriangle, faEye,
  faImage, faPlus, faSpinner, faTimesCircle, faTruck, faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';

import { ShippingsService } from '../../../services/shippings.service';
import { Shipping, ShippingStatus, CreateShippingPayload, UpdateStatusPayload } from '../../../models/shipping.model';
import { UpdateStatusModalComponent } from "./update-status-modal/update-status-modal.component";

@Component({
  selector: 'app-shippings-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, UpdateStatusModalComponent],
  templateUrl: './shippings-manager.component.html',
})
export class ShippingsManagerComponent implements OnInit {
  private shippingsService = inject(ShippingsService);

  // --- Estado del Componente ---
  public shippings: Shipping[] = [];
  public selectedShipping: Shipping | null = null;
  public isLoading = true;
  public error: string | null = null;

  // --- Estado del Modal de Actualización ---
  public isUpdateStatusModalOpen = false;
  public isSubmitting = false;
  public updateStatusPayload: any = this.getInitialUpdateStatusPayload();
  public readonly availableStatuses: Exclude<ShippingStatus, 'preparando'>[] = ['en_transito', 'entregado', 'fallido'];
  public guiaImagePreview: string | null = null;
  public fileError: string | null = null;

  // --- Íconos ---
  faPlus = faPlus;
  faCircleNotch = faCircleNotch;
  faEye = faEye;
  faExclamationTriangle = faExclamationTriangle;
  faEdit = faEdit;
  faImage = faImage;
  faSpinner = faSpinner;
  faTruck = faTruck;

  public readonly statusInfo: { [key in ShippingStatus]: { icon: IconDefinition; color: string; label: string }; } = {
    preparando: { icon: faWarehouse, color: 'text-yellow-500', label: 'Preparando' },
    en_transito: { icon: faTruck, color: 'text-blue-500', label: 'En Tránsito' },
    entregado: { icon: faCheckCircle, color: 'text-green-500', label: 'Entregado' },
    fallido: { icon: faTimesCircle, color: 'text-red-500', label: 'Fallido' },
  };

  ngOnInit(): void {
    this.loadShippings();
  }

  loadShippings(): void {
    this.isLoading = true;
    this.error = null;
    this.shippingsService.getAllShippings()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.shippings = data.sort((a, b) => new Date(b.fechaEstimada || 0).getTime() - new Date(a.fechaEstimada || 0).getTime());
          if (this.selectedShipping) {
            this.selectedShipping = this.shippings.find(s => s.id === this.selectedShipping?.id) || null;
          }
        },
        error: (err) => { this.error = 'No se pudieron cargar los envíos.'; console.error(err); },
      });
  }

  selectShipping(shipping: Shipping): void {
    this.selectedShipping = shipping;
  }

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
    if (file.size > 5 * 1024 * 1024) { // Límite de 5MB
        this.fileError = "El archivo es muy grande (máx 5MB).";
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.guiaImagePreview = reader.result as string;
      this.updateStatusPayload.comprobanteGuiaBase64 = reader.result as string;
      this.fileError = null;
    };
    reader.onerror = () => { this.fileError = "No se pudo leer el archivo."; }
    reader.readAsDataURL(file);
  }

  handleUpdateStatusSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }
    if (this.updateStatusPayload.estado === 'en_transito' && !this.updateStatusPayload.comprobanteGuiaBase64) {
        this.fileError = "La foto del comprobante es obligatoria.";
        return;
    }
    if (!this.selectedShipping) return;
    this.isSubmitting = true;

    const finalPayload: UpdateStatusPayload = {
      estado: this.updateStatusPayload.estado,
      description: this.updateStatusPayload.description,
    };

    // if (finalPayload.estado === 'en_transito') {
    //   finalPayload.comprobanteGuiaBase64 = this.updateStatusPayload.comprobanteGuiaBase64;
    //   finalPayload.guia = this.updateStatusPayload.guia;
    //   finalPayload.transportadora = this.updateStatusPayload.transportadora;
    //   finalPayload.fechaEstimada = this.updateStatusPayload.fechaEstimada;
    //   finalPayload.direccionEntrega = this.updateStatusPayload.direccionEntrega;
    // }

    this.shippingsService.updateShippingStatus(this.selectedShipping.id, finalPayload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.closeUpdateStatusModal();
          this.loadShippings();
        },
        error: (err) => { alert('Error al actualizar el estado del envío.'); console.error(err); }
      });
  }

  private getInitialUpdateStatusPayload(): any {
    const today = new Date().toISOString().split('T')[0];
    // this.selectedShipping?.fechaEstimada.split('T')[0] ||
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

  getStatusInfo(status: ShippingStatus) { return this.statusInfo[status]; }
}

