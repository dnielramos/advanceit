import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner, faEye } from '@fortawesome/free-solid-svg-icons';
import { HeaderCrudComponent } from '../../../shared/header-dashboard/heeader-crud.component';
import { RmasService } from '../../../services/rmas.service';
import { Rma } from '../../../models/rma.model';
import { CreateRmaModalComponent } from './create-rma-modal/create-rma-modal.component';
import { ManageRmaModalComponent } from './manage-rma-modal/manage-rma-modal.component';

@Component({
  selector: 'app-rma-management',
  standalone: true,
  // Importamos módulos clave para un componente standalone
  imports: [
    CommonModule,
    FontAwesomeModule,
    HeaderCrudComponent,
    CreateRmaModalComponent,
    ManageRmaModalComponent,
  ],
  templateUrl: './rma-manager.component.html',
  // No hay 'styleUrls' ya que todo el estilo está en el HTML con Tailwind
})
export class RmaManagerComponent implements OnInit {
  private readonly rmaService = inject(RmasService);
  private readonly router = inject(Router);

  // Iconos
  faSpinner = faSpinner;
  faEye = faEye;

  // Estados de la UI manejados con Signals
  allRmas = signal<Rma[]>([]);
  selectedRma = signal<Rma | null>(null);
  showCreateModal = signal(false);
  showManageModal = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Filtros
  searchQuery = signal<string>('');
  estadoFilter = signal<string>('');

  // View mode (list by default to preserve current UI)
  viewMode = signal<'grid' | 'list'>('list');

  onViewChange(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  // Mapa de estados ES -> EN para filtros
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

  // Helpers de estado
  private toStateCode(input: string): string {
    if (!input) return '';
    const norm = input.toString().trim();
    // Si ya es código EN
    if (Object.values(this.stateMapEsToEn).includes(norm)) return norm;
    // Si es etiqueta ES
    const found = this.stateMapEsToEn[norm];
    return found || norm.toLowerCase();
  }

  private matchesTextQuery(rma: Rma, q: string): boolean {
    if (!q) return true;
    const query = q.toLowerCase().trim();

    const inRmaNumber = (rma.rma_number || '').toString().toLowerCase().includes(query);
    const inOrderId = (rma.order_id || '').toString().toLowerCase().includes(query);
    const inMotivo = (rma.motivo || '').toString().toLowerCase().includes(query);

    // Estado: probar contra código y etiqueta
    const code = this.toStateCode((rma as any).estado || '');
    const esLabel = Object.entries(this.stateMapEsToEn).find(([, v]) => v === code)?.[0] || '';
    const inEstado = code.includes(query) || esLabel.toLowerCase().includes(query);

    // Fechas: created_at o fecha_solicitud
    const fecha = (rma as any).fecha_solicitud || (rma as any).created_at || '';
    const fechaStr = fecha ? new Date(fecha).toLocaleString().toLowerCase() : '';
    const inFecha = fechaStr.includes(query);

    // Evidencias: buscar en JSON
    const evidenciasStr = (() => {
      try { return JSON.stringify((rma as any).evidencias || []).toLowerCase(); } catch { return ''; }
    })();
    const inEvidencias = evidenciasStr.includes(query);

    return inRmaNumber || inOrderId || inMotivo || inEstado || inFecha || inEvidencias;
  }

  // RMAs filtradas (computed)
  rmas = computed(() => {
    const query = this.searchQuery();
    const estadoSelected = this.estadoFilter(); // Puede venir como ES label o EN code
    const estadoCode = this.toStateCode(estadoSelected);
    const list = this.allRmas();

    return list.filter(rma => {
      const matchesText = this.matchesTextQuery(rma, query);
      const matchesState = !estadoCode || this.toStateCode((rma as any).estado || '') === estadoCode;
      return matchesText && matchesState;
    });
  });

  // Estados disponibles para filtrar (UI en español)
  availableStates = Object.keys(this.stateMapEsToEn);

  ngOnInit(): void {
    this.loadRmas();
  }

  loadRmas(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.rmaService.findAllRmas().subscribe({
      next: (response) => {
        this.allRmas.set(response.data);
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

  handleFilterChange(filters: { texto: string; estado: string }): void {
    this.searchQuery.set(filters.texto);
    this.estadoFilter.set(filters.estado);
  }

  handleClearFilters(): void {
    this.searchQuery.set('');
    this.estadoFilter.set('');
  }

  openCreateModal(): void {
    // Redirigir a la nueva ruta de creación de solicitudes
    this.router.navigate(['/dashboard/solicitudes/nueva']);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  handleRmaCreated(): void {
    this.closeCreateModal();
    this.loadRmas();
  }

  selectRma(rma: Rma): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.rmaService.findRmaById(rma.id).subscribe({
      next: (response) => {
        this.selectedRma.set(response.data);
        this.showManageModal.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(`Error al cargar la RMA: ${err.error?.message || err.message}`);
        this.isLoading.set(false);
      },
    });
  }

  closeManageModal(): void {
    this.showManageModal.set(false);
    this.selectedRma.set(null);
  }

  handleRmaUpdated(): void {
    this.closeManageModal();
    this.loadRmas();
  }

  handleRmaDeleted(): void {
    this.closeManageModal();
    this.loadRmas();
  }

  getStateColor(estado: string): string {
    // Normalizar a código EN y asignar paletas representativas
    const code = this.toStateCode(estado);
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

  getStateLabel(estado: string): string {
    const code = this.toStateCode(estado);
    const entry = Object.entries(this.stateMapEsToEn).find(([, v]) => v === code);
    return entry ? entry[0] : (estado || '');
  }
}
