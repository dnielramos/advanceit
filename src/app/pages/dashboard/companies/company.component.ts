import { Component, signal, computed, inject, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontAwesomeModule, FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { faEye, faPen, faTrash, faPlus, faSearch, faXmark, faSpinner, faRotateRight, faBuilding, faMapMarkerAlt, faIndustry, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { CompaniesService, Company } from "../../../services/companies.service";
import { CompanyDetailModalComponent } from "./company-detail-modal.component";
import { CompanyEditModalComponent } from "./company-edit-modal";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { HeaderCrudComponent } from "../../../shared/header-dashboard/heeader-crud.component";
import { ViewportService } from '../../../services/viewport.service';
import { SkeletonCardComponent } from '../../../components/skeleton-card/skeleton-card.component';
import { SkeletonTableComponent } from '../../../components/skeleton-table/skeleton-table.component';

// ===== Listado principal =====
@Component({
  selector: 'app-company',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CompanyDetailModalComponent,
    CompanyEditModalComponent,
    HeaderCrudComponent,
    SkeletonCardComponent,
    SkeletonTableComponent
  ],
  templateUrl: './company.component.html'
})
export class CompanyComponent {
  private service = inject(CompaniesService);
  private fa = inject(FaIconLibrary);

  // === Properties ===
  data = signal<Company[]>([]);
  loading = signal<boolean>(false);
  query = signal<string>('');
  estadoFilter = signal<string>('');
  page = signal<number>(0);
  pageSize = signal<number>(10);

  // Estados disponibles para filtrar
  availableStates: string[] = ['ACTIVO', 'INACTIVO'];

  // Modales
  showDetail = signal<boolean>(false);
  showEdit = signal<boolean>(false);
  selectedId = signal<string | undefined>(undefined);
  selectedCompany = signal<Company | undefined>(undefined);

  // === Computed properties ===
  filtered = computed(() => {
    const q = (this.query() || '').toLowerCase().trim();
    const estado = this.estadoFilter();
    const list = this.data();

    return list.filter(c => {
      const matchesText = !q || c.razon_social.toLowerCase().includes(q) || c.nit.toLowerCase().includes(q);
      const matchesState = !estado || c.estado === estado;
      return matchesText && matchesState;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  paginated = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  // View mode (list by default to preserve current UI)
  viewMode = signal<'grid' | 'list'>('list');
  private viewportService = inject(ViewportService);
  readonly isMobile = this.viewportService.isMobile;

  onViewChange(mode: 'grid' | 'list') {
    if (this.isMobile()) {
      return;
    }
    this.viewMode.set(mode);
  }

  faEye: IconProp = faEye;
  faPen: IconProp = faPen;
  faTrash: IconProp = faTrash;

  faPlus: IconProp = faPlus;
  faSearch: IconProp = faSearch;
  faXmark: IconProp = faXmark;
  faSpinner: IconProp = faSpinner;
  faRotateRight: IconProp = faRotateRight;
  faBuilding: IconProp = faBuilding;
  faMapMarkerAlt: IconProp = faMapMarkerAlt;
  faIndustry: IconProp = faIndustry;
  faGlobe: IconProp = faGlobe;

  constructor() {
    this.fa.addIcons(faEye, faPen, faTrash, faPlus, faSearch, faXmark, faSpinner, faRotateRight, faBuilding, faMapMarkerAlt, faIndustry, faGlobe);
    this.fetchAll();
    effect(() => {
      if (this.isMobile()) {
        this.viewMode.set('grid');
      }
    });
  }

  // === Methods ===
  onQueryChange() { this.page.set(0); }

  handleFilterChange(filters: { texto: string; estado: string }): void {
    this.query.set(filters.texto);
    this.estadoFilter.set(filters.estado);
    this.page.set(0);
  }

  handleClearFilters(): void {
    this.query.set('');
    this.estadoFilter.set('');
    this.page.set(0);
  }

  fetchAll() {
    this.loading.set(true);
    this.service.findAll().subscribe({
      next: (rows) => { this.data.set(rows); this.loading.set(false); },
      error: _ => { this.loading.set(false); }
    });
  }

  refresh() { this.fetchAll(); }

  // Paginación
  nextPage() {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(p => p + 1);
    }
  }
  prevPage() {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
    }
  }

  // Modales
  openDetail(id: string) {
    this.selectedId.set(id);
    this.showDetail.set(true);
  }
  closeDetail() {
    this.showDetail.set(false);
    this.selectedId.set(undefined);
  }

  openEdit(company?: Company) {
    this.selectedCompany.set(company);
    this.showEdit.set(true);
  }
  openCreate() {
    this.openEdit(undefined);
  }
  closeEdit() {
    this.showEdit.set(false);
    this.selectedCompany.set(undefined);
  }

  onSaved(updated: Company) {
    const list = this.data();
    const idx = list.findIndex(c => c.id === updated.id);

    if (idx !== -1) {
      // Update existing item using a new array for signal update
      this.data.set(list.map((c, i) => i === idx ? updated : c));
    } else {
      // Add new item to the beginning of the list
      this.data.set([updated, ...list]);
    }
    this.closeEdit();
  }

  confirmDelete(id: string) {
    if (!confirm('¿Eliminar esta empresa?')) {
      return;
    }
    this.service.softDelete(id).subscribe({
      next: _ => {
        // Success: update the local list
        this.data.set(this.data().filter(c => c.id !== id));
      },
      error: _ => {
        // Handle error: e.g., show a toast or alert
        console.error('Failed to delete company.');
      }
    });
  }
}
