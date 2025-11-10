import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
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

  // Iconos
  faSpinner = faSpinner;

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

  // RMAs filtradas (computed)
  rmas = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const estado = this.estadoFilter();
    const list = this.allRmas();

    return list.filter(rma => {
      const matchesText = !query || 
        rma.rma_number.toLowerCase().includes(query) ||
        rma.order_id.toLowerCase().includes(query) ||
        rma.motivo.toLowerCase().includes(query);
      const matchesState = !estado || rma.estado === estado;
      return matchesText && matchesState;
    });
  });

  // Estados disponibles para filtrar
  availableStates = ['Pendiente', 'Recibido', 'En Revisión', 'Aprobado', 'Rechazado', 'Cerrado'];

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
    this.showCreateModal.set(true);
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
