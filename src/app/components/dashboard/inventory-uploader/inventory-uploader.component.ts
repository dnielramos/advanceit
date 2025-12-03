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
  id?: string;
  company: string;
  inventory: any[];
  columns: string[];
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
  private router = inject(Router);

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
  tempCompany = '';
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
    this.tempCompany = '';
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
      setTimeout(() => this.isCreateInventory.set(true), 300);
    } else {
      // Si no hay detalle activo, abrir directamente
      this.isCreateInventory.set(true);
    }
  }

  handleFilterChange(event: { estado?: string; texto: string }) {
    // Lógica para manejar el cambio de filtro
    console.log('Filtro cambiado:', event);

    // Guardar el texto de búsqueda global
    this.searchText.set(event.texto);

    // Si NO estás en detalle de inventario, filtra empresas
    if (!this.selectedCompany()) {
      this.inventoriesService.getAllInventories().subscribe({
        next: (data: any[]) => {
          const mapped: CompanyInventory[] = (data || []).map((item) => ({
            id: item.id,
            company: item.company,
            inventory: item.inventory ?? [],
            columns:
              item.columns ??
              (item.inventory?.[0] ? Object.keys(item.inventory[0]) : []),
            created_at: item.created_at ?? item.createdAt ?? null,
          }));

          this.companies.set(
            mapped.filter(
              (c) =>
                (!event.estado || c.company === event.estado) &&
                (!event.texto ||
                  c.company.toLowerCase().includes(event.texto.toLowerCase()))
            )
          );
        },
        error: (err) => console.error('Error cargando inventarios', err),
      });
    }
  }

  // ======================================================
  // Cargar inventarios existentes
  // ======================================================
  loadAllInventories() {
    this.isLoadingCompanies.set(true);
    this.inventoriesService.getAllInventories().subscribe({
      next: (data: any[]) => {
        const mapped: CompanyInventory[] = (data || []).map((item) => ({
          id: item.id,
          company: item.company,
          inventory: item.inventory ?? [],
          columns:
            item.columns ??
            (item.inventory?.[0] ? Object.keys(item.inventory[0]) : []),
          created_at: item.created_at ?? item.createdAt ?? null,
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
    if (!this.tempCompany || this.previewData().length === 0) return;

    this.isSavingInventory.set(true);
    this.uploadStatus.set('saving');

    const payload: InventoryPayload = {
      company: this.tempCompany,
      inventory: this.previewData(),
      created_by: 'system', // aquí podrías poner el usuario logueado
    };

    this.inventoriesService.createInventory(payload).subscribe({
      next: (response) => {
        console.log('Inventario creado con éxito:', response);
        this.uploadStatus.set('success');
        this.isSavingInventory.set(false);

        // Mostrar éxito por 2 segundos y luego limpiar
        setTimeout(() => {
          this.loadAllInventories(); // recargar lista
          this.onCloseCreateInventory();
          this.uploadStatus.set('idle');
        }, 1500);
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
    this.selectedCompany.set(company);
    this.isAddingItem.set(false);

    // Inicializar objeto base para nuevo ítem con todas las columnas de la empresa
    const cols = company.columns && company.columns.length
      ? company.columns
      : (company.inventory?.[0] ? Object.keys(company.inventory[0]) : []);

    const base: any = {};
    (cols || []).forEach((col) => {
      base[col] = '';
    });
    this.newItem = base;
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
      company: company.company,
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
        company: company.company,
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
