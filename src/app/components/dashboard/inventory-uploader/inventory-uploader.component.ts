// src/app/components/inventory-browser/inventory-browser.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import {
  CompanyInventoriesService,
  InventoryPayload,
} from '../../../services/company-inventories.service';
import { CompaniesService, Company } from '../../../services/companies.service';
import { forkJoin } from 'rxjs';
import { HeaderCrudComponent } from '../../../shared/header-dashboard/heeader-crud.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SkeletonCardComponent } from '../../skeleton-card/skeleton-card.component';
import { SkeletonTableComponent } from '../../skeleton-table/skeleton-table.component';
import {
  faBuilding,
  faUpload,
  faFloppyDisk,
  faSpinner,
  faTimes,
  faEye,
  faHourglassHalf,
  faCheckCircle,
  faCircleExclamation,
  faChevronRight,
  faCalendarDay,
  faTrash,
  faPen,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { ViewModeService } from '../../../services/view-mode.service';

interface CompanyInventory {
  id: string;
  company_id: string;
  company_name: string; // Nombre de la empresa
  item_count: number;   // Cantidad de items (del listado)
  inventory: any[];     // Items del inventario (se carga al ver detalle)
  columns: string[];    // Columnas detectadas
  created_at?: string;
}

@Component({
  selector: 'app-inventory-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderCrudComponent, FontAwesomeModule, SkeletonCardComponent, SkeletonTableComponent],
  templateUrl: './inventory-uploader.component.html',
})
export class InventoryUploaderComponent implements OnInit {
  private inventoriesService = inject(CompanyInventoriesService);
  private companiesService = inject(CompaniesService);
  private router = inject(Router);

  // Mapa de empresas para lookup rápido
  private companiesMap = new Map<string, Company>();

  // Icons
  faBuilding = faBuilding;
  faUpload = faUpload;
  faFloppyDisk = faFloppyDisk;
  faSpinner = faSpinner;
  faTimes = faTimes;
  faEye = faEye;
  faHourglassHalf = faHourglassHalf;
  faCheckCircle = faCheckCircle;
  faCircleExclamation = faCircleExclamation;
  faChevronRight = faChevronRight;
  faCalendarDay = faCalendarDay;
  faTrash = faTrash;
  faPen = faPen;
  faExclamationTriangle = faExclamationTriangle;

  // Estado general
  companies = signal<CompanyInventory[]>([]);
  selectedCompany = signal<CompanyInventory | null>(null);
  isCreateInventory = signal<boolean>(false);

  // Estados de carga y progreso
  isLoadingCompanies = signal<boolean>(false);
  isProcessingFile = signal<boolean>(false);
  isSavingInventory = signal<boolean>(false);
  fileUploadProgress = signal<number>(0);
  fileSize = signal<string>('');
  fileError = signal<string>('');
  uploadStatus = signal<'idle' | 'reading' | 'saving' | 'success' | 'error'>('idle');

  // Para ver detalle de inventario
  selectedInventory = computed(() => this.selectedCompany()?.inventory || []);
  selectedColumns = computed(() => this.selectedCompany()?.columns || []);

  // Para añadir nuevos productos al inventario de la empresa seleccionada
  isAddingItem = signal<boolean>(false);
  newItem: any = {};

  // Para registrar inventario
  previewData = signal<any[]>([]);
  previewColumns = signal<string[]>([]);
  selectedCompanyId = ''; // ID de la empresa seleccionada en el select
  availableCompanies = signal<Company[]>([]); // Lista de empresas para el select
  tempFile: File | null = null;

  // Dentro de la clase InventoryUploaderComponent
  searchText = signal<string>('');
  private viewModeService = inject(ViewModeService);
  viewMode = this.viewModeService.viewMode;
  filteredInventory = computed(() => {
    const company = this.selectedCompany();
    const text = this.searchText().toLowerCase().trim();

    if (!company || !text) {
      return company?.inventory || [];
    }

    const columns = company.columns || [];

    return company.inventory.filter((row) =>
      columns.some((col) => {
        const value = row[col];
        return value != null && String(value).toLowerCase().includes(text);
      })
    );
  });

  // Carga inicial
  // Carga inicial
  ngOnInit(): void {
    this.loadAllInventories();
  }

  openDellSupport() {
  window.open('https://www.dell.com/support/home/es-es', '_blank');
}

  handleClearFilters() {
    this.searchText.set('');
    this.loadAllInventories();
  }

  onCloseCreateInventory() {
    this.isCreateInventory.set(false);
    this.selectedCompanyId = '';
    this.tempFile = null;
    this.previewData.set([]);
    this.previewColumns.set([]);
    this.fileError.set('');
    this.fileSize.set('');
    this.fileUploadProgress.set(0);
    this.uploadStatus.set('idle');
    this.isProcessingFile.set(false);
    this.isSavingInventory.set(false);
  }

  // Cerrar modal al hacer clic en el overlay (fondo oscuro)
  closeModalOnOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCloseCreateInventory();
    }
  }

  onCreateInventory() {
    // Si estamos en detalle, cerrar primero para evitar superponer modales
    if (this.selectedCompany()) {
      this.closeInventory();
      // Abrir modal después de cerrar el detalle (dar tiempo para animación)
      setTimeout(() => this.openCreateModal(), 300);
    } else {
      this.openCreateModal();
    }
  }

  private openCreateModal() {
    // Cargar lista de empresas disponibles para el select (solo activas)
    this.companiesService.findAll().subscribe({
      next: (companies) => {
        // Filtrar solo empresas con estado ACTIVO
        const activeCompanies = companies.filter(c => 
          c.estado?.toUpperCase() === 'ACTIVO' || c.estado?.toUpperCase() === 'ACTIVE'
        );
        this.availableCompanies.set(activeCompanies);
        this.isCreateInventory.set(true);
      },
      error: (err) => {
        console.error('Error cargando empresas:', err);
        this.fileError.set('Error al cargar las empresas disponibles');
      }
    });
  }

  handleFilterChange(event: { estado?: string; texto: string }) {
    // Lógica para manejar el cambio de filtro
    console.log('Filtro cambiado:', event);

    // Guardar el texto de búsqueda global
    this.searchText.set(event.texto);

    // Si NO estás en detalle de inventario, filtra empresas localmente
    if (!this.selectedCompany()) {
      const allCompanies = this.companies();
      const filtered = allCompanies.filter(
        (c) =>
          (!event.estado || c.company_id === event.estado) &&
          (!event.texto ||
            c.company_name.toLowerCase().includes(event.texto.toLowerCase()))
      );
      this.companies.set(filtered);
      
      // Si no hay filtro, recargar todo
      if (!event.texto && !event.estado) {
        this.loadAllInventories();
      }
    }
  }

  // ======================================================
  // Cargar inventarios existentes
  // ======================================================
  loadAllInventories() {
    this.isLoadingCompanies.set(true);
    
    this.inventoriesService.getAllInventories().subscribe({
      next: (inventories) => {
        const mapped: CompanyInventory[] = (inventories || []).map((item: any) => ({
          id: item.id,
          company_id: item.company_id,
          company_name: item.company || 'Empresa desconocida', // El backend ya devuelve el nombre
          item_count: item.item_count || 0,
          inventory: [], // Se carga al ver el detalle
          columns: item.detected_columns || [],
          created_at: item.created_at ?? null,
        }));
        
        // Ordenar por fecha desc
        this.companies.set(
          mapped.sort((a, b) => {
            const da = a.created_at ? new Date(a.created_at).getTime() : 0;
            const db = b.created_at ? new Date(b.created_at).getTime() : 0;
            return db - da;
          })
        );
        this.isLoadingCompanies.set(false);
      },
      error: (err) => {
        console.error('Error cargando inventarios', err);
        this.isLoadingCompanies.set(false);
      },
    });
  }

  // ======================================================
  // Subida de archivo Excel
  // ======================================================
  handleFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Limpiar errores previos
    this.fileError.set('');
    this.uploadStatus.set('idle');

    // Validar archivo
    const validation = this.inventoriesService.validateFile(file);
    if (!validation.isValid) {
      this.fileError.set(validation.error || 'Archivo inválido');
      this.uploadStatus.set('error');
      return;
    }

    this.tempFile = file;
    this.fileSize.set(this.inventoriesService.getReadableFileSize(file.size));
    this.isProcessingFile.set(true);
    this.uploadStatus.set('reading');
    this.fileUploadProgress.set(0);

    const reader = new FileReader();

    // Simular progreso de lectura
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        this.fileUploadProgress.set(progress);
        this.inventoriesService.updateProgress(event.loaded, event.total);
      }
    };

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (json.length === 0) {
          this.fileError.set('El archivo Excel está vacío o no contiene datos válidos.');
          this.uploadStatus.set('error');
          this.isProcessingFile.set(false);
          return;
        }

        this.previewData.set(json);
        this.previewColumns.set(Object.keys(json[0] || {}));
        this.uploadStatus.set('success');
        this.fileUploadProgress.set(100);

        // Limpiar progreso después de 1.5 segundos
        setTimeout(() => {
          this.fileUploadProgress.set(0);
        }, 1500);
      } catch (error) {
        console.error('Error al procesar archivo:', error);
        this.fileError.set('Error al procesar el archivo. Verifica que sea un Excel válido.');
        this.uploadStatus.set('error');
      } finally {
        this.isProcessingFile.set(false);
      }
    };

    reader.onerror = () => {
      this.fileError.set('Error al leer el archivo.');
      this.uploadStatus.set('error');
      this.isProcessingFile.set(false);
    };

    reader.readAsArrayBuffer(file);
  }

  // ======================================================
  // Guardar inventario en backend
  // ======================================================
  saveInventory() {
    if (!this.selectedCompanyId || this.previewData().length === 0) return;

    this.isSavingInventory.set(true);
    this.uploadStatus.set('saving');

    const payload: InventoryPayload = {
      company_id: this.selectedCompanyId,
      inventory: this.previewData(),
      created_by: 'system', // aquí podrías poner el usuario logueado
    };

    this.inventoriesService.createInventory(payload).subscribe({
      next: (response) => {
        console.log('Inventario creado con éxito:', response);
        this.uploadStatus.set('success');
        
        // Cerrar modal, recargar lista y limpiar estado
        this.onCloseCreateInventory();
        this.loadAllInventories();
      },
      error: (error) => {
        console.error('Error al crear inventario:', error);
        this.fileError.set(
          error?.error?.message ||
            'Error al guardar el inventario. Intenta nuevamente.'
        );
        this.uploadStatus.set('error');
        this.isSavingInventory.set(false);
      },
    });
  }

  // ======================================================
  // Ver detalle de inventario
  // ======================================================
  viewInventory(company: CompanyInventory) {
    this.isAddingItem.set(false);
    
    // Cargar el detalle del inventario (con los items)
    this.isLoadingCompanies.set(true);
    this.inventoriesService.getInventoryById(company.id).subscribe({
      next: (detail: any) => {
        // Actualizar el inventario con los items cargados
        const fullInventory: CompanyInventory = {
          ...company,
          inventory: detail.inventory || [],
          columns: detail.detected_columns || company.columns || [],
        };
        
        this.selectedCompany.set(fullInventory);
        
        // Inicializar objeto base para nuevo ítem
        const cols = fullInventory.columns;
        const base: any = {};
        cols.forEach((col) => {
          base[col] = '';
        });
        this.newItem = base;
        this.isLoadingCompanies.set(false);
      },
      error: (err) => {
        console.error('Error cargando detalle del inventario:', err);
        this.isLoadingCompanies.set(false);
      }
    });
  }

  closeInventory() {
    this.selectedCompany.set(null);
  }

  // ======================================================
  // Añadir nuevo producto al inventario (solo consola por ahora)
  // ======================================================
  handleAddItem() {
    const company = this.selectedCompany();
    if (!company) return;

    const payload = {
      company_id: company.company_id,
      company_name: company.company_name,
      columns: company.columns,
      item: { ...this.newItem },
    };

    console.log('📦 Nuevo producto para inventario (payload):', payload);
  }

  // ======================================================
  // Cambio de vista
  // ======================================================
  // ======================================================
  // Cambio de vista
  // ======================================================
  handleViewChange(mode: 'grid' | 'list') {
    this.viewModeService.setViewMode(mode);
  }

  // ======================================================
  // Navegar a detalle de producto
  // ======================================================
  viewProductDetail(product: any, index: number) {
    const company = this.selectedCompany();
    if (!company) return;

    this.router.navigate(['/dashboard/inventory-uploader/product', index], {
      state: {
        product,
        company_id: company.company_id,
        company_name: company.company_name,
        columns: company.columns,
      },
    });
  }

  // ======================================================
  // Logo helpers
  // ======================================================
  private normalizeCompanyForLogo(name: string): string {
    return (name || '').toLowerCase().replace(/\s+/g, '');
  }

  getCompanyLogo(name: string): string {
    const base = `assets/logos/${this.normalizeCompanyForLogo(name)}`;
    return `${base}.png`;
  }

  onLogoError(event: Event, name: string): void {
    const img = event.target as HTMLImageElement;
    const base = `assets/logos/${this.normalizeCompanyForLogo(name)}`;
    if (img && img.dataset && img.dataset['fallback'] !== 'jpg') {
      img.src = `${base}.jpg`;
      img.dataset['fallback'] = 'jpg';
    } else {
      img.src = 'logo.png';
    }
  }

  // ======================================================
  // Eliminar inventario
  // ======================================================
  confirmDeleteInventory(id: string | undefined, companyName: string) {
    if (!id) return;

    const confirmed = confirm(
      `¿Estás seguro de que deseas eliminar el inventario de "${companyName}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    this.inventoriesService.deleteInventory(id).subscribe({
      next: () => {
        // Remover de la lista local
        this.companies.set(this.companies().filter(c => c.id !== id));
        // Cerrar detalle si está abierto
        if (this.selectedCompany()?.id === id) {
          this.closeInventory();
        }
      },
      error: (err) => {
        console.error('Error al eliminar inventario:', err);
        alert('Error al eliminar el inventario. Intenta nuevamente.');
      },
    });
  }

  capitalizeCompany(name: string): string {
    if (!name) return '';
    const lower = name.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
}
