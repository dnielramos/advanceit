import { Component, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FontAwesomeModule, FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { faEye, faPen, faTrash, faPlus, faSearch, faXmark, faSpinner, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { CompaniesService, Company } from "../../../services/companies.service";
import { CompanyDetailModalComponent } from "./company-detail-modal.component";
import { CompanyEditModalComponent } from "./company-edit-modal";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { HeaderCrudComponent } from "../../../shared/header-dashboard/heeader-crud.component";

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
    HeaderCrudComponent
  ],
  template: `
    <section class="hflexy animate__animated animate__fadeIn bg-slate-50">
      <div class="max-w-7xl mx-auto p-4 md:p-8">

        <app-header-crud
          titulo="Empresas"
          descripcion="Gestiona las empresas que pueden comprar en tu plataforma"
          textoBotonNuevo="Nueva Empresa"
          textoBotonActualizar="Actualizar"
          [showViewToggle]="true"
          [currentView]="viewMode()"
          (viewChange)="onViewChange($event)"
          [filterByStatus]="true"
          [filterStatusValues]="availableStates"
          placeholderInput="Buscar por razón social o NIT..."
          (crear)="openCreate()"
          (actualizar)="refresh()"
          (filterChange)="handleFilterChange($event)"
          (clearFilters)="handleClearFilters()">
        </app-header-crud>
        <!-- List view (tabla) -->
        <div *ngIf="viewMode() === 'list'" class="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-gray-600">
              <tr>
                <th class="px-4 py-3 text-left">Razón social</th>
                <th class="px-4 py-3 text-left">NIT</th>
                <th class="px-4 py-3 text-left">Industria</th>
                <th class="px-4 py-3 text-left">Ubicación</th>
                <th class="px-4 py-3 text-left">Estado</th>
                <th class="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of paginated()" class="border-t border-gray-100 hover:bg-purple-50/40">
                <td class="px-4 py-3 font-medium text-gray-900">{{ c.razon_social }}</td>
                <td class="px-4 py-3 text-gray-700">{{ c.nit }}</td>
                <td class="px-4 py-3 text-gray-700">{{ c.industria }}</td>
                <td class="px-4 py-3 text-gray-700">{{ c.ciudad }}, {{ c.pais }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                        [class.bg-green-100]="c.estado==='ACTIVO'" [class.text-green-700]="c.estado==='ACTIVO'"
                        [class.bg-gray-100]="c.estado!=='ACTIVO'" [class.text-gray-700]="c.estado!=='ACTIVO'">
                    <span class="h-2 w-2 rounded-full" [class.bg-green-500]="c.estado==='ACTIVO'" [class.bg-gray-400]="c.estado!=='ACTIVO'"></span>
                    {{ c.estado }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="inline-flex items-center gap-2">
                    <button class="icon-btn" (click)="openDetail(c.id)" title="Ver">
                      <fa-icon [icon]="faEye"></fa-icon>
                    </button>
                    <button class="icon-btn" (click)="openEdit(c)" title="Editar">
                      <fa-icon [icon]="faPen"></fa-icon>
                    </button>
                    <button class="icon-btn-danger" (click)="confirmDelete(c.id)" title="Eliminar">
                      <fa-icon [icon]="faTrash"></fa-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!loading() && filtered().length===0" class="p-10 text-center text-gray-500">Sin resultados.</div>
          <div *ngIf="loading()" class="p-10 flex items-center justify-center gap-2 text-gray-600"><fa-icon [icon]="faSpinner" class="animate-spin"></fa-icon> Cargando...</div>
        </div>

        <!-- Grid view (tarjetas) -->
        <div *ngIf="viewMode() === 'grid'" class="mt-4">
          <div *ngIf="!loading() && filtered().length===0" class="p-10 text-center text-gray-500">Sin resultados.</div>
          <div *ngIf="loading()" class="p-10 flex items-center justify-center gap-2 text-gray-600"><fa-icon [icon]="faSpinner" class="animate-spin"></fa-icon> Cargando...</div>
          <div *ngIf="!loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let c of paginated()" class="bg-white p-5 rounded-xl shadow-sm border-t-4 border-purple-500 transition hover:shadow-md">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-sm font-semibold text-gray-900">{{ c.razon_social }}</h3>
                  <p class="text-xs text-gray-500 mt-1">NIT: {{ c.nit }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ c.industria }}</p>
                  <p class="text-xs text-gray-400 mt-2">{{ c.ciudad }}, {{ c.pais }}</p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                        [class.bg-green-100]="c.estado==='ACTIVO'" [class.text-green-700]="c.estado==='ACTIVO'"
                        [class.bg-gray-100]="c.estado!=='ACTIVO'" [class.text-gray-700]="c.estado!=='ACTIVO'">
                    <span class="h-2 w-2 rounded-full" [class.bg-green-500]="c.estado==='ACTIVO'" [class.bg-gray-400]="c.estado!=='ACTIVO'"></span>
                    {{ c.estado }}
                  </span>
                </div>
              </div>

              <div class="mt-4 flex items-center justify-end gap-2">
                <button class="icon-btn" (click)="openDetail(c.id)" title="Ver">
                  <fa-icon [icon]="faEye"></fa-icon>
                </button>
                <button class="icon-btn" (click)="openEdit(c)" title="Editar">
                  <fa-icon [icon]="faPen"></fa-icon>
                </button>
                <button class="icon-btn-danger" (click)="confirmDelete(c.id)" title="Eliminar">
                  <fa-icon [icon]="faTrash"></fa-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>Página {{ page() + 1 }} de {{ totalPages() }}</div>
          <div class="flex items-center gap-2">
            <button class="btn-secondary" (click)="prevPage()" [disabled]="page()===0">Anterior</button>
            <button class="btn-secondary" (click)="nextPage()" [disabled]="page()+1>=totalPages()">Siguiente</button>
          </div>
        </div>
      </div>

      <company-detail-modal *ngIf="showDetail()" [id]="selectedId()" (closed)="closeDetail()"></company-detail-modal>
      <company-edit-modal *ngIf="showEdit()" [company]="selectedCompany()" (saved)="onSaved($event)" (close)="closeEdit()"></company-edit-modal>
    </section>
  `,
  styles: [`

  `]
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

  onViewChange(mode: 'grid' | 'list') {
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

  constructor() {
    this.fa.addIcons(faEye, faPen, faTrash, faPlus, faSearch, faXmark, faSpinner, faRotateRight);
    this.fetchAll();
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
