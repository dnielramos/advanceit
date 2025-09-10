import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importaciones de FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  IconDefinition,
  faBox,
  faCheckCircle,
  faCircleNotch,
  faEye,
  faPlus,
  faShippingFast,
  faTimesCircle,
  faTruck,
  faWarehouse,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

// Tus modelos y servicios
import { ShippingsService } from '../../../services/shippings.service';
import { Shipping, ShippingStatus, CreateShippingPayload } from '../../../models/shipping.model';
import { finalize } from 'rxjs';

// Objeto para mapear estados a íconos y colores (mejora la legibilidad del template)
type StatusInfo = {
  [key in ShippingStatus]: { icon: IconDefinition; color: string; label: string };
};

@Component({
  selector: 'app-shippings-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './shippings-manager.component.html',
})
export class ShippingsManagerComponent implements OnInit {
  // Inyección de dependencias moderna
  private shippingsService = inject(ShippingsService);

  // Estado del componente
  public shippings: Shipping[] = [];
  public selectedShipping: Shipping | null = null;
  public isLoading = true;
  public error: string | null = null;

  // Estado del modal de creación
  public isModalOpen = false;
  public newShipping: CreateShippingPayload = this.getInitialNewShippingPayload();

  // --- Íconos de FontAwesome ---
  faPlus = faPlus;
  faCircleNotch = faCircleNotch;
  faEye = faEye;
  faExclamationTriangle = faExclamationTriangle;

  // Mapeo de estados para la UI
  public readonly statusInfo: StatusInfo = {
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
          this.shippings = data;
          // Si había un envío seleccionado, lo actualizamos con la nueva data
          if (this.selectedShipping) {
            this.selectedShipping = this.shippings.find(s => s.id === this.selectedShipping?.id) || null;
          }
        },
        error: (err) => {
          this.error = 'No se pudieron cargar los envíos. Intenta de nuevo más tarde.';
          console.error(err);
        },
      });
  }

  selectShipping(shipping: Shipping): void {
    this.selectedShipping = shipping;
  }

  clearSelection(): void {
      this.selectedShipping = null;
  }

  openCreateModal(): void {
    this.newShipping = this.getInitialNewShippingPayload();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  handleCreateSubmit(): void {
    // Aquí iría una validación más robusta (p.ej. con Zod o FormControls)
    if (!this.newShipping.order_id || !this.newShipping.guia || !this.newShipping.transportadora) {
        alert('Por favor completa todos los campos requeridos.');
        return;
    }

    this.shippingsService.createShipping(this.newShipping).subscribe({
      next: () => {
        this.closeModal();
        this.loadShippings(); // Recargamos la lista para ver el nuevo envío
      },
      error: (err) => {
        alert('Error al crear el envío.');
        console.error(err);
      }
    });
  }
  
  // Función para obtener un nuevo objeto para el formulario de creación
  private getInitialNewShippingPayload(): CreateShippingPayload {
    return {
      order_id: '',
      transportadora: '',
      guia: '',
      fechaEstimada: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
      notas: '',
    };
  }

  // Helper para obtener la info de estado en el template
  getStatusInfo(status: ShippingStatus) {
    return this.statusInfo[status];
  }
}