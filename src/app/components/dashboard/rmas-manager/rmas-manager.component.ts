import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';

// Importaciones de FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoxOpen,
  faPlus,
  faSpinner,
  faExclamationTriangle,
  faArrowLeft,
  faTrash,
  faSave,
  faPaperPlane,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

// --- Servicio ---
// En una app real, esto estaría en `rmas.service.ts` y se proveería en 'root'.
// Lo incluimos aquí (y en providers) para que el ejemplo sea autocontenido.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../../../../enviroments/enviroment';

// --- Modelos (Inferidos del controlador) ---
// En una app real, estarían en `rma.model.ts`
export interface Rma {
  id: string;
  rma_number: string;
  order_id: string;
  estado: string;
  motivo: string;
  evidencias: any[];
  notas: string | null;
  created_at: Date;
  // Agrega aquí cualquier otro campo que devuelva tu servicio
}

export interface CreateRmaDto {
  order_id: string;
  motivo: string;
  items: { product_id: string; quantity: number }[]; // Asumiendo estructura de items
}

export interface UpdateRmaDataDto {
  motivo?: string;
  evidencias?: any[];
  notas?: string;
}

export interface UpdateRmaStateDto {
  nextState: string;
  notas?: string;
}

// Servicio mínimo basado en tu controlador.
@Injectable()
export class RmasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${ENVIRONMENT.apiUrlRender}/rmas`; // Ajusta a tu URL de API real

  findAllRmas(): Observable<{ total: number; data: Rma[] }> {
    return this.http.get<{ total: number; data: Rma[] }>(this.apiUrl);
  }

  findRmaById(id: string): Observable<{ data: Rma }> {
    return this.http.get<{ data: Rma }>(`${this.apiUrl}/${id}`);
  }

  createRma(body: CreateRmaDto): Observable<{ message: string; data: Rma }> {
    return this.http.post<{ message: string; data: Rma }>(this.apiUrl, body);
  }

  updateRmaState(
    id: string,
    nextState: string,
    notas?: string,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/state`, {
      nextState,
      notas,
    });
  }

  updateRmaData(
    id: string,
    body: UpdateRmaDataDto,
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}`, body);
  }

  deleteRma(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
// --- Fin del Servicio ---

@Component({
  selector: 'app-rma-management',
  standalone: true,
  // Importamos módulos clave para un componente standalone
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule, // Necesario para que el servicio inyecte HttpClient
    FontAwesomeModule,
  ],
  // Proveemos el servicio aquí para que el ejemplo sea autocontenido
  providers: [RmasService],
  templateUrl: './rma-manager.component.html',
  // No hay 'styleUrls' ya que todo el estilo está en el HTML con Tailwind
})
export class RmaManagerComponent implements OnInit {
  private readonly rmaService = inject(RmasService);
  private readonly fb = inject(FormBuilder);

  // Iconos de FontAwesome
  faBoxOpen = faBoxOpen;
  faPlus = faPlus;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faArrowLeft = faArrowLeft;
  faTrash = faTrash;
  faSave = faSave;
  faPaperPlane = faPaperPlane;
  faTimes = faTimes;

  // Estados de la UI manejados con Signals
  rmas = signal<Rma[]>([]);
  selectedRma = signal<Rma | null>(null);
  currentView = signal<'list' | 'details' | 'create'>('list');
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Formularios Reactivos
  createForm: FormGroup;
  updateDataForm: FormGroup;
  updateStateForm: FormGroup;

  // Estados posibles (simulados, ajústalos a tu lógica de negocio)
  possibleStates = ['Pendiente', 'Recibido', 'En Revisión', 'Aprobado', 'Rechazado', 'Cerrado'];

  constructor() {
    this.createForm = this.fb.group({
      order_id: ['', [Validators.required, Validators.minLength(5)]],
      motivo: ['', [Validators.required, Validators.minLength(10)]],
      // Simplificamos 'items' a un string JSON por simplicidad en este ejemplo
      items: ['[{"product_id": "SKU123", "quantity": 1}]', [Validators.required, this.jsonValidator]],
    });

    this.updateDataForm = this.fb.group({
      motivo: [''],
      notas: [''],
      // 'evidencias' es complejo (any[]), lo manejamos como JSON string
      evidencias: ['[]', [this.jsonValidator]],
    });

    this.updateStateForm = this.fb.group({
      nextState: ['', [Validators.required]],
      notas: [''],
    });
  }

  ngOnInit(): void {
    this.loadRmas();
  }

  // Validador simple de JSON
  jsonValidator(control: any) {
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  // --- Métodos de Carga y Navegación ---

  loadRmas(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.rmaService.findAllRmas().subscribe({
      next: (response) => {
        this.rmas.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(
          `Error al cargar las RMAs: ${err.error?.message || err.message}`,
        );
        this.isLoading.set(false);
      },
    });
  }

  selectRma(rma: Rma): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.rmaService.findRmaById(rma.id).subscribe({
      next: (response) => {
        const fullRma = response.data;
        this.selectedRma.set(fullRma);
        // Poblamos los formularios con los datos de la RMA seleccionada
        this.updateDataForm.patchValue({
          motivo: fullRma.motivo,
          notas: fullRma.notas || '',
          evidencias: JSON.stringify(fullRma.evidencias || [], null, 2),
        });
        this.updateStateForm.patchValue({
          nextState: fullRma.estado,
          notas: '',
        });
        this.currentView.set('details');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(`Error al cargar la RMA: ${err.error?.message || err.message}`);
        this.isLoading.set(false);
      },
    });
  }

  showCreateView(): void {
    this.createForm.reset({
      items: '[{"product_id": "SKU123", "quantity": 1}]'
    });
    this.selectedRma.set(null);
    this.currentView.set('create');
    this.clearMessages();
  }

  showListView(): void {
    this.selectedRma.set(null);
    this.currentView.set('list');
    this.clearMessages();
    this.loadRmas(); // Recargar la lista
  }

  // --- Métodos de Interacción con API (CRUD) ---

  handleCreateRma(): void {
    if (this.createForm.invalid) {
      this.error.set('Formulario inválido. Revisa los campos.');
      return;
    }
    this.isLoading.set(true);
    this.clearMessages();

    try {
      const formValue = this.createForm.value;
      const dto: CreateRmaDto = {
        order_id: formValue.order_id,
        motivo: formValue.motivo,
        items: JSON.parse(formValue.items), // Parseamos el JSON string
      };

      this.rmaService.createRma(dto).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.success.set(response.message);
          this.showListView(); // Volver a la lista después de crear
        },
        error: (err) => this.handleApiError('crear', err),
      });
    } catch (e) {
      this.isLoading.set(false);
      this.error.set('Error al parsear los items. Asegúrate que sea un JSON válido.');
    }
  }

  handleUpdateData(): void {
    const rma = this.selectedRma();
    if (!rma || this.updateDataForm.invalid) {
      this.error.set('Formulario de datos inválido.');
      return;
    }
    this.isLoading.set(true);
    this.clearMessages();

    try {
      const formValue = this.updateDataForm.value;
      const dto: UpdateRmaDataDto = {
        motivo: formValue.motivo,
        notas: formValue.notas,
        evidencias: JSON.parse(formValue.evidencias), // Parseamos el JSON
      };

      this.rmaService.updateRmaData(rma.id, dto).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.success.set(response.message);
          // Recargamos los datos de la RMA seleccionada
          this.selectRma(rma);
        },
        error: (err) => this.handleApiError('actualizar los datos', err),
      });
    } catch (e) {
      this.isLoading.set(false);
      this.error.set('Error al parsear las evidencias. Asegúrate que sea un JSON válido.');
    }
  }

  handleUpdateState(): void {
    const rma = this.selectedRma();
    if (!rma || this.updateStateForm.invalid) {
      this.error.set('Debes seleccionar un estado.');
      return;
    }
    this.isLoading.set(true);
    this.clearMessages();

    const formValue = this.updateStateForm.value;

    this.rmaService
      .updateRmaState(rma.id, formValue.nextState, formValue.notas)
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.success.set(response.message);
          this.updateStateForm.reset();
          // Recargamos los datos de la RMA seleccionada
          this.selectRma(rma);
        },
        error: (err) => this.handleApiError('actualizar el estado', err),
      });
  }

  handleDeleteRma(): void {
    const rma = this.selectedRma();
    if (!rma) return;

    // Pedir confirmación
    if (!confirm(`¿Estás seguro de eliminar la RMA #${rma.rma_number}? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    this.rmaService.deleteRma(rma.id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.success.set(response.message);
        this.showListView(); // Volver a la lista
      },
      error: (err) => this.handleApiError('eliminar', err),
    });
  }

  // --- Helpers ---

  private handleApiError(action: string, err: any): void {
    this.isLoading.set(false);
    this.error.set(
      `Error al ${action} la RMA: ${err.error?.message || err.message}`,
    );
  }

  private clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }

  // Helper para obtener el color del badge de estado
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
}
