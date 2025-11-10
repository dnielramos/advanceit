import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faTimes, 
  faSave, 
  faPaperPlane, 
  faTrash, 
  faSpinner,
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { RmasService } from '../../../../services/rmas.service';
import { Rma, UpdateRmaDataDto } from '../../../../models/rma.model';

@Component({
  selector: 'app-manage-rma-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './manage-rma-modal.component.html',
})
export class ManageRmaModalComponent implements OnInit {
  private readonly rmaService = inject(RmasService);
  private readonly fb = inject(FormBuilder);

  @Input() rma!: Rma;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  // Icons
  faTimes = faTimes;
  faSave = faSave;
  faPaperPlane = faPaperPlane;
  faTrash = faTrash;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;

  // State
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Forms
  updateDataForm!: FormGroup;
  updateStateForm!: FormGroup;

  // Estados: UI en Español -> Backend en Inglés
  private stateMapEsToEn: Record<string, string> = {
    'Pendiente': 'pending_review',
    'Aprobado': 'approved',
    'Rechazado': 'rejected',
    'En Tránsito': 'in_transit',
    'Recibido': 'received',
    'Inspeccionado': 'inspected',
    'Resuelto': 'resolved',
    'Cerrado': 'closed',
  };

  // Opciones para el selector: [labelEs, codeEn]
  stateOptions: Array<[string, string]> = Object.entries(this.stateMapEsToEn);

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    this.updateDataForm = this.fb.group({
      motivo: [this.rma.motivo || ''],
      notas: [this.rma.notas || ''],
      evidencias: [JSON.stringify(this.rma.evidencias || [], null, 2), [this.jsonValidator]],
    });

    this.updateStateForm = this.fb.group({
      // Siempre guardar en el form el código en inglés
      nextState: [this.getStateCode(this.rma.estado), [Validators.required]],
      notas: [''],
    });
  }

  jsonValidator(control: any) {
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  handleUpdateData(): void {
    if (this.updateDataForm.invalid) {
      this.error.set('Formulario de datos inválido.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const formValue = this.updateDataForm.value;
      const dto: UpdateRmaDataDto = {
        motivo: formValue.motivo,
        notas: formValue.notas,
        evidencias: JSON.parse(formValue.evidencias),
      };

      this.rmaService.updateRmaData(this.rma.id, dto).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.success.set(response.message);
          setTimeout(() => this.updated.emit(), 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(`Error al actualizar los datos: ${err.error?.message || err.message}`);
        },
      });
    } catch (e) {
      this.isLoading.set(false);
      this.error.set('Error al parsear las evidencias. Asegúrate que sea un JSON válido.');
    }
  }

  handleUpdateState(): void {
    if (this.updateStateForm.invalid) {
      this.error.set('Debes seleccionar un estado.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.updateStateForm.value;
    const stateCode = this.getStateCode(formValue.nextState);

    this.rmaService.updateRmaState(this.rma.id, stateCode, formValue.notas).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.success.set(response.message);
        this.updateStateForm.reset({ nextState: stateCode, notas: '' });
        setTimeout(() => this.updated.emit(), 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Error al actualizar el estado: ${err.error?.message || err.message}`);
      },
    });
  }

  handleDelete(): void {
    if (!confirm(`¿Estás seguro de eliminar la RMA #${this.rma.rma_number}? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.rmaService.deleteRma(this.rma.id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.deleted.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Error al eliminar: ${err.error?.message || err.message}`);
      },
    });
  }

  getStateColor(state: string): string {
    // Normalizar a código en inglés para colorear de forma consistente
    const code = this.getStateCode(state).toLowerCase();
    switch (code) {
      case 'pending_review':
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
      case 'received':
      case 'inspected':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  }

  // Helpers de traducción
  private getStateCode(input: string): string {
    if (!input) return '';
    const normalized = input.toString().trim();
    // Si ya viene en inglés
    if (Object.values(this.stateMapEsToEn).includes(normalized)) {
      return normalized;
    }
    // Si viene en español
    const found = this.stateMapEsToEn[normalized];
    return found || normalized;
  }

  getStateLabel(input: string): string {
    if (!input) return '';
    const code = this.getStateCode(input);
    const entry = Object.entries(this.stateMapEsToEn).find(([, v]) => v === code);
    return entry ? entry[0] : input;
  }

  closeModal(): void {
    this.close.emit();
  }
}
