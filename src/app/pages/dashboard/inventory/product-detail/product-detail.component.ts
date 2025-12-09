import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LocationMapComponent } from '../../../../components/dashboard/location-map/location-map.component';
import {
  faArrowLeft,
  faBox,
  faBarcode,
  faCalendar,
  faBuilding,
  faMapMarkerAlt,
  faUser,
  faLaptop,
  faExternalLinkAlt,
  faInfoCircle,
  faPencil,
  faTrash,
  faFloppyDisk,
  faTimes,
  faSpinner,
  faCheckCircle,
  faCircleExclamation,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { CompanyInventoriesService } from '../../../../services/company-inventories.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, LocationMapComponent, FormsModule],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Icons
  faArrowLeft = faArrowLeft;
  faBox = faBox;
  faBarcode = faBarcode;
  faCalendar = faCalendar;
  faBuilding = faBuilding;
  faMapMarkerAlt = faMapMarkerAlt;
  faUser = faUser;
  faLaptop = faLaptop;
  faExternalLinkAlt = faExternalLinkAlt;
  faInfoCircle = faInfoCircle;
  faPencil = faPencil;
  faTrash = faTrash;
  faFloppyDisk = faFloppyDisk;
  faTimes = faTimes;
  faSpinner = faSpinner;
  faCheckCircle = faCheckCircle;
  faCircleExclamation = faCircleExclamation;
  faTriangleExclamation = faTriangleExclamation;

  // Service
  private inventoriesService = inject(CompanyInventoriesService);

  // State
  productData = signal<any>(null);
  companyName = signal<string>('');
  columns = signal<string[]>([]);
  inventoryId = signal<string>('');
  productIndex = signal<number>(-1);
  companyId = signal<string>('');

  // Edit mode
  isEditMode = signal<boolean>(false);
  editedData = signal<any>({});
  isSaving = signal<boolean>(false);
  saveError = signal<string>('');

  // Delete confirmation
  showDeleteModal = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  deleteError = signal<string>('');

  // Feedback modal
  showFeedbackModal = signal<boolean>(false);
  feedbackType = signal<'success' | 'error'>('success');
  feedbackMessage = signal<string>('');
  
  // Computed para obtener la dirección completa
  fullAddress = computed(() => {
    const product = this.productData();
    if (!product) return '';
    
    // Buscar todos los posibles campos de ubicación
    const city = product['City '] || product['City'] || product['Ciudad'] || '';
    const state = product['State'] || product['Estado'] || product['State '] || '';
    const country = product['Country'] || product['País'] || product['Country '] || '';
    const address = product['Address'] || product['Dirección'] || product['Address '] || '';
    const zipCode = product['Zip Code'] || product['Código Postal'] || product['Zip Code '] || '';
    
    // Construir dirección de manera inteligente
    const parts = [];
    
    if (address) parts.push(address);
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (zipCode) parts.push(zipCode);
    if (country) parts.push(country);
    
    // Si no hay país pero hay ciudad, intentar con solo ciudad y estado
    const fullAddr = parts.filter(p => p).join(', ');
    
    return fullAddr || city || 'Ubicación no disponible';
  });
  
  showMap = signal<boolean>(false);

  private readonly STORAGE_KEY = 'product_detail_state';

  ngOnInit(): void {
    // Scroll al inicio del contenedor principal al entrar al componente
    // El scroll está en el <main> del dashboard layout, no en window
    this.scrollToTop();
    
    // Obtener datos de la navegación - usar history.state directamente
    // ya que getCurrentNavigation() puede ser null cuando el componente se inicializa
    let state = history.state;

    console.log('🔍 Estado recibido en product-detail (history.state):', state);

    // Si no hay datos en history.state, intentar recuperar de sessionStorage
    if (!state?.product) {
      const savedState = sessionStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        try {
          state = JSON.parse(savedState);
          console.log('🔄 Estado recuperado de sessionStorage:', state);
        } catch (e) {
          console.error('Error parsing saved state:', e);
        }
      }
    }

    if (state?.product) {
      this.productData.set(state.product);
      this.companyName.set(state.company_name || state.company || '');
      this.columns.set(state.columns || Object.keys(state.product));
      this.inventoryId.set(state.inventory_id || '');
      this.companyId.set(state.company_id || '');
      
      // Obtener el índice del producto de la URL (el parámetro se llama 'id' en la ruta)
      const indexParam = this.route.snapshot.paramMap.get('id');
      console.log('📍 Parámetro de ruta (id):', indexParam);
      if (indexParam) {
        this.productIndex.set(parseInt(indexParam, 10));
      }
      
      // Inicializar datos editados
      this.editedData.set({ ...state.product });
      
      // Si viene con editMode, activar modo edición automáticamente
      if (state.editMode) {
        this.isEditMode.set(true);
      }

      // Guardar estado en sessionStorage para recuperarlo si se recarga la página
      this.saveStateToStorage(state);
      
      console.log('✅ Producto cargado:', {
        index: this.productIndex(),
        inventoryId: this.inventoryId(),
        companyId: this.companyId(),
        editMode: state.editMode,
        hasInventoryId: !!this.inventoryId()
      });
    } else {
      console.warn('⚠️ No hay datos de producto en el estado, volviendo atrás');
      // Si no hay datos, volver atrás
      this.goBack();
    }
  }

  private saveStateToStorage(state: any): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        product: state.product,
        company_name: state.company_name,
        company_id: state.company_id,
        columns: state.columns,
        inventory_id: state.inventory_id,
        editMode: state.editMode
      }));
    } catch (e) {
      console.error('Error saving state to sessionStorage:', e);
    }
  }

  goBack(): void {
    // Limpiar el estado guardado al volver
    sessionStorage.removeItem(this.STORAGE_KEY);
    
    // Navegar de vuelta pasando el inventoryId para que se abra el inventario correcto
    const inventoryId = this.inventoryId();
    const companyId = this.companyId();
    const companyName = this.companyName();
    const columns = this.columns();
    
    if (inventoryId) {
      // Navegar con estado para reabrir el inventario
      this.router.navigate(['/dashboard/inventory-uploader'], {
        state: {
          returnToInventory: true,
          inventory_id: inventoryId,
          company_id: companyId,
          company_name: companyName,
          columns: columns,
          scrollToIndex: this.productIndex()
        }
      });
    } else {
      this.router.navigate(['/dashboard/inventory-uploader']);
    }
  }

  /**
   * Hace scroll al inicio del contenedor principal del dashboard
   */
  private scrollToTop(): void {
    // El scroll está en el <main> del dashboard layout, no en window
    // Buscar el contenedor main con overflow-y-auto
    setTimeout(() => {
      const mainContainer = document.querySelector('main.overflow-y-auto');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        // Fallback a window si no encuentra el contenedor
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 0);
  }

  openDellSupport(): void {
    window.open('https://www.dell.com/support/home/es-es', '_blank');
  }

  // Obtener valor de una columna
  getValue(col: string): any {
    return this.productData()?.[col] || 'N/A';
  }

  // Verificar si es columna importante
  isImportantColumn(col: string): boolean {
    const important = ['service tag', 'laptop model', 'serial', 'first name', 'last name', 'city'];
    return important.some(imp => col.toLowerCase().includes(imp));
  }
  
  // Toggle mapa
  toggleMap(): void {
    this.showMap.update(v => !v);
  }
  
  // Verificar si tiene ubicación
  hasLocation(): boolean {
    const addr = this.fullAddress();
    return addr !== '' && addr !== 'Ubicación no disponible';
  }
  
  // Obtener solo la ciudad para búsquedas más simples
  getCityOnly(): string {
    const product = this.productData();
    if (!product) return '';
    
    const city = product['City '] || product['City'] || product['Ciudad'] || '';
    const country = product['Country'] || product['País'] || product['Country '] || '';
    
    if (city && country) {
      return `${city}, ${country}`;
    }
    return city;
  }

  // Logo helpers
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
    if (img && (img as any).dataset && (img as any).dataset['fallback'] !== 'jpg') {
      img.src = `${base}.jpg`;
      (img as any).dataset['fallback'] = 'jpg';
    } else {
      img.src = 'logo.png';
    }
  }

  capitalizeCompany(name: string): string {
    if (!name) return '';
    const lower = name.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  // ======================================================
  // Modo Edición
  // ======================================================
  enableEditMode(): void {
    this.editedData.set({ ...this.productData() });
    this.isEditMode.set(true);
    this.saveError.set('');
  }

  cancelEditMode(): void {
    this.isEditMode.set(false);
    this.editedData.set({ ...this.productData() });
    this.saveError.set('');
  }

  updateEditedField(col: string, value: string): void {
    const current = this.editedData();
    this.editedData.set({ ...current, [col]: value });
  }

  saveChanges(): void {
    const inventoryId = this.inventoryId();
    const index = this.productIndex();
    
    console.log('💾 saveChanges - datos:', {
      inventoryId,
      index,
      hasInventoryId: !!inventoryId,
      indexValid: index >= 0
    });
    
    if (!inventoryId || index < 0) {
      console.error('❌ saveChanges - Falta información:', { inventoryId, index });
      this.showFeedback('error', `No se puede guardar: falta información del inventario. (ID: ${inventoryId || 'vacío'}, Index: ${index})`);
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');

    const updatedItem = this.editedData();
    
    console.log('💾 saveChanges - Enviando al backend:', {
      inventoryId,
      index,
      item: updatedItem
    });

    this.inventoriesService.updateItemByIndex(inventoryId, index, updatedItem).subscribe({
      next: (response) => {
        console.log('✅ Producto actualizado:', response);
        
        // Actualizar datos locales
        this.productData.set({ ...updatedItem });
        this.isEditMode.set(false);
        this.isSaving.set(false);
        
        // Actualizar sessionStorage con los nuevos datos
        this.saveStateToStorage({
          product: updatedItem,
          company_name: this.companyName(),
          company_id: this.companyId(),
          columns: this.columns(),
          inventory_id: inventoryId,
          editMode: false
        });
        
        // Mostrar feedback de éxito
        this.showFeedback('success', '¡Producto actualizado exitosamente!');
      },
      error: (err) => {
        console.error('❌ Error al actualizar:', err);
        this.isSaving.set(false);
        this.showFeedback('error', err?.error?.message || 'Error al actualizar el producto. Intenta nuevamente.');
      }
    });
  }

  // ======================================================
  // Eliminar Producto
  // ======================================================
  openDeleteModal(): void {
    this.showDeleteModal.set(true);
    this.deleteError.set('');
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deleteError.set('');
  }

  confirmDelete(): void {
    const inventoryId = this.inventoryId();
    const index = this.productIndex();
    
    console.log('🗑️ confirmDelete - datos:', {
      inventoryId,
      index,
      hasInventoryId: !!inventoryId,
      indexValid: index >= 0
    });
    
    if (!inventoryId || index < 0) {
      console.error('❌ confirmDelete - Falta información:', { inventoryId, index });
      this.deleteError.set(`No se puede eliminar: falta información del inventario. (ID: ${inventoryId || 'vacío'}, Index: ${index})`);
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set('');

    console.log('🗑️ confirmDelete - Enviando DELETE al backend:', {
      url: `company-inventories/${inventoryId}/items/${index}`
    });

    this.inventoriesService.deleteItemByIndex(inventoryId, index).subscribe({
      next: (response) => {
        console.log('✅ Producto eliminado:', response);
        this.isDeleting.set(false);
        this.closeDeleteModal();
        
        // Limpiar sessionStorage
        sessionStorage.removeItem(this.STORAGE_KEY);
        
        // Mostrar feedback y redirigir
        this.showFeedback('success', 'Producto eliminado correctamente.');
        
        // Redirigir después de un momento
        setTimeout(() => {
          this.goBack();
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Error al eliminar:', err);
        this.isDeleting.set(false);
        this.deleteError.set(err?.error?.message || 'Error al eliminar el producto. Intenta nuevamente.');
      }
    });
  }

  // ======================================================
  // Modal de Feedback
  // ======================================================
  showFeedback(type: 'success' | 'error', message: string): void {
    this.feedbackType.set(type);
    this.feedbackMessage.set(message);
    this.showFeedbackModal.set(true);
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal.set(false);
  }

  // Obtener valor editado
  getEditedValue(col: string): any {
    return this.editedData()?.[col] || '';
  }
}
