import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faSave,
  faTrashAlt,
  faBox,
  faCalendarAlt,
  faFileAlt,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faBoxOpen,
  faShoppingCart,
  faEdit,
  faTimes,
  faInfoCircle,
  faClipboardList,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';
import { RmasService } from '../../../../services/rmas.service';
import { Rma, UpdateRmaDataDto } from '../../../../models/rma.model';
import { ToastService } from 'angular-toastify';
import { CreateRmaShippingModalComponent } from '../../../../components/dashboard/rmas-manager/create-rma-shipping-modal/create-rma-shipping-modal.component';

@Component({
  selector: 'app-rma-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, CreateRmaShippingModalComponent],
  templateUrl: './rma-detail.component.html',
})
export class RmaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rmaService = inject(RmasService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  // Icons
  faArrowLeft = faArrowLeft;
  faSave = faSave;
  faTrashAlt = faTrashAlt;
  faBox = faBox;
  faCalendarAlt = faCalendarAlt;
  faFileAlt = faFileAlt;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;
  faBoxOpen = faBoxOpen;
  faShoppingCart = faShoppingCart;
  faEdit = faEdit;
  faTimes = faTimes;
  faInfoCircle = faInfoCircle;
  faClipboardList = faClipboardList;
  faTruck = faTruck;

  // State
  rma = signal<Rma | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'details' | 'items' | 'history'>('details');
  isShippingModalOpen = signal(false);

  // Forms
  updateDataForm!: FormGroup;
  updateStateForm!: FormGroup;

  // Estados: UI en Español -> Backend en Inglés
  private stateMapEsToEn: Record<string, string> = {
    'Pendiente': 'pending_review',
    'En Revisión': 'in_review',
    'Aprobado': 'approved',
    'Rechazado': 'rejected',
    'En Tránsito': 'in_transit',
    'Recibido': 'received',
    'Inspeccionado': 'inspected',
    'Resuelto': 'resolved',
    'Cerrado': 'closed',
  };

  stateOptions: Array<[string, string]> = Object.entries(this.stateMapEsToEn);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRma(id);
    } else {
      this.error.set('ID de RMA no válido');
    }
  }

  loadRma(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.rmaService.findRmaById(id).subscribe({
      next: (response) => {
        this.rma.set(response.data);
        this.initializeForms();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(`Error al cargar la RMA: ${err.error?.message || err.message}`);
        this.isLoading.set(false);
      },
    });
  }

  initializeForms(): void {
    const currentRma = this.rma();
    if (!currentRma) return;

    this.updateDataForm = this.fb.group({
      motivo: [currentRma.motivo || ''],
      notas: [currentRma.notas || ''],
      evidencias: [JSON.stringify(currentRma.evidencias || [], null, 2), [this.jsonValidator]],
    });

    this.updateStateForm = this.fb.group({
      nextState: [this.getStateCode(currentRma.estado), [Validators.required]],
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

  getRmaItems(): Array<{ product_id: string; product_name: string; quantity: number; serial: string }> {
    const currentRma = this.rma();
    if (!currentRma) return [];

    try {
      const raw = (currentRma as any)?.evidencias;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(data)) return [];
      return data.map((it: any, idx: number) => ({
        product_id: it.product_id || it.id || `item-${idx}`,
        product_name: it.product_name || it.name || 'Producto',
        quantity: Number(it.quantity ?? 1) || 1,
        serial: it.serial || it.product_id || '',
      }));
    } catch {
      return [];
    }
  }

  handleUpdateData(): void {
    if (this.updateDataForm.invalid) {
      this.toast.error('Formulario de datos inválido.');
      return;
    }

    const currentRma = this.rma();
    if (!currentRma) return;

    this.isSaving.set(true);

    try {
      const formValue = this.updateDataForm.value;
      const dto: UpdateRmaDataDto = {
        motivo: formValue.motivo,
        notas: formValue.notas,
        evidencias: JSON.parse(formValue.evidencias),
      };

      this.rmaService.updateRmaData(currentRma.id, dto).subscribe({
        next: (response) => {
          this.toast.success(response.message || 'Datos actualizados correctamente');
          this.loadRma(currentRma.id);
          this.isSaving.set(false);
        },
        error: (err) => {
          this.toast.error(`Error al actualizar: ${err.error?.message || err.message}`);
          this.isSaving.set(false);
        },
      });
    } catch (e) {
      this.toast.error('Error al parsear las evidencias. Asegúrate que sea un JSON válido.');
      this.isSaving.set(false);
    }
  }

  handleUpdateState(): void {
    if (this.updateStateForm.invalid) {
      this.toast.error('Debes seleccionar un estado.');
      return;
    }

    const currentRma = this.rma();
    if (!currentRma) return;

    this.isSaving.set(true);

    const formValue = this.updateStateForm.value;
    const stateCode = this.getStateCode(formValue.nextState);

    this.rmaService.updateRmaState(currentRma.id, stateCode, formValue.notas).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'Estado actualizado correctamente');
        this.updateStateForm.patchValue({ notas: '' });
        this.loadRma(currentRma.id);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.toast.error(`Error al actualizar estado: ${err.error?.message || err.message}`);
        this.isSaving.set(false);
      },
    });
  }

  handleDelete(): void {
    const currentRma = this.rma();
    if (!currentRma) return;

    if (!confirm(`¿Estás seguro de eliminar la RMA #${currentRma.rma_number}? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.isSaving.set(true);

    this.rmaService.deleteRma(currentRma.id).subscribe({
      next: () => {
        this.toast.success('RMA eliminada correctamente');
        this.router.navigate(['/dashboard/solicitudes']);
      },
      error: (err) => {
        this.toast.error(`Error al eliminar: ${err.error?.message || err.message}`);
        this.isSaving.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/solicitudes']);
  }

  setActiveTab(tab: 'details' | 'items' | 'history'): void {
    this.activeTab.set(tab);
  }

  getStateColor(state: string): string {
    const code = this.getStateCode(state).toLowerCase();
    switch (code) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'in_review':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-300';
      case 'in_transit':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'received':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'inspected':
        return 'bg-violet-100 text-violet-800 border border-violet-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'closed':
        return 'bg-slate-100 text-slate-800 border border-slate-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  }

  private getStateCode(input: string): string {
    if (!input) return '';
    const normalized = input.toString().trim();
    if (Object.values(this.stateMapEsToEn).includes(normalized)) {
      return normalized;
    }
    const found = this.stateMapEsToEn[normalized];
    return found || normalized;
  }

  getStateLabel(input: string): string {
    if (!input) return '';
    const code = this.getStateCode(input);
    const entry = Object.entries(this.stateMapEsToEn).find(([, v]) => v === code);
    return entry ? entry[0] : input;
  }

  openShippingModal(): void {
    this.isShippingModalOpen.set(true);
  }

  closeShippingModal(): void {
    this.isShippingModalOpen.set(false);
  }
}
