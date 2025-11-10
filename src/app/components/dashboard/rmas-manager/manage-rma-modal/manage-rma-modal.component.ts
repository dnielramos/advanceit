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

  // Estados posibles
  possibleStates = ['Pendiente', 'Recibido', 'En Revisión', 'Aprobado', 'Rechazado', 'Cerrado'];

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
      nextState: [this.rma.estado, [Validators.required]],
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

    this.rmaService.updateRmaState(this.rma.id, formValue.nextState, formValue.notas).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.success.set(response.message);
        this.updateStateForm.reset({ nextState: formValue.nextState, notas: '' });
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

  getStateColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en revisión':
      case 'recibido':
        return 'bg-blue-100 text-blue-800';
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
      case 'cerrado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
