import { Component, Output, EventEmitter, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faPaperPlane, faSpinner, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { RmasService } from '../../../../services/rmas.service';
import { CreateRmaDto } from '../../../../models/rma.model';
import { CompaniesService, Company } from '../../../../services/companies.service';
import { CompanyInventoriesService } from '../../../../services/company-inventories.service';

@Component({
  selector: 'app-create-rma-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './create-rma-modal.component.html',
})
export class CreateRmaModalComponent implements OnInit {
  private readonly rmaService = inject(RmasService);
  private readonly fb = inject(FormBuilder);
  private readonly companiesService = inject(CompaniesService);
  private readonly inventoryService = inject(CompanyInventoriesService);

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  // Icons
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faSpinner = faSpinner;
  faPlus = faPlus;
  faTrash = faTrash;

  // State
  isLoading = signal(false);
  error = signal<string | null>(null);
  companies = signal<Company[]>([]);
  inventory = signal<any[]>([]);
  selectedProducts = signal<any[]>([]);
  requestType = signal<'rma' | 'transfer'>('rma');
  
  // Computed
  isCompanySelected = computed(() => !!this.createForm?.get('company_id')?.value);
  hasInventory = computed(() => this.inventory().length > 0);

  // Form
  createForm: FormGroup;

  constructor() {
    this.createForm = this.fb.group({
      request_type: ['rma', [Validators.required]],
      company_id: ['', [Validators.required]],
      order_id: [''],
      motivo: [''],
      // Para traslados
      new_user: [''],
      new_location: [''],
    });
  }

  ngOnInit(): void {
    console.log('🚀 CreateRmaModal - ngOnInit');
    this.loadCompanies();
    
    // Escuchar cambios en el tipo de solicitud
    this.createForm.get('request_type')?.valueChanges.subscribe(type => {
      console.log('📝 Tipo de solicitud cambiado:', type);
      this.requestType.set(type);
      this.updateValidators();
    });
    
    // Escuchar cambios en la empresa seleccionada
    this.createForm.get('company_id')?.valueChanges.subscribe(companyId => {
      console.log('🏢 Empresa seleccionada:', companyId);
      if (companyId) {
        this.loadInventoryByCompany(companyId);
      } else {
        this.inventory.set([]);
        this.selectedProducts.set([]);
      }
    });
  }

  updateValidators(): void {
    const newUserControl = this.createForm.get('new_user');
    const newLocationControl = this.createForm.get('new_location');
    
    if (this.requestType() === 'transfer') {
      newUserControl?.setValidators([Validators.required]);
      newLocationControl?.setValidators([Validators.required]);
    } else {
      newUserControl?.clearValidators();
      newLocationControl?.clearValidators();
    }
    
    newUserControl?.updateValueAndValidity();
    newLocationControl?.updateValueAndValidity();
  }

  loadCompanies(): void {
    console.log('📋 Cargando empresas...');
    this.isLoading.set(true);
    this.error.set(null);
    
    this.companiesService.findAll().subscribe({
      next: (companies) => {
        console.log('✅ Empresas recibidas:', companies);
        console.log('🔍 Estados de empresas:', companies.map(c => ({ razon_social: c.razon_social.toLocaleLowerCase().trim(), estado: c.estado.toLocaleLowerCase().trim() })));
        
        // Filtrar empresas activas (case insensitive y trimmed)
        const activeCompanies = companies.filter(c => 
          c.estado && c.estado.toLocaleLowerCase().trim() === 'activo'
        );
        
        console.log('✅ Empresas activas filtradas:', activeCompanies);
        
        // Si no hay empresas activas, mostrar todas
        if (activeCompanies.length === 0) {
          console.log('⚠️ No hay empresas con estado "activo", mostrando todas las empresas');
          this.companies.set(companies);
        } else {
          this.companies.set(activeCompanies);
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error al cargar empresas:', err);
        this.error.set(`Error al cargar empresas: ${err.message}`);
        this.isLoading.set(false);
      }
    });
  }

  loadInventoryByCompany(companyId: string | number): void {
    console.log('📦 Cargando inventario para empresa ID:', companyId, 'Tipo:', typeof companyId);
    this.isLoading.set(true);
    this.error.set(null);
    
    // Buscar la empresa seleccionada para obtener su razón social
    // Convertir companyId a número para comparación
    const companyIdNum = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
    console.log('🔢 Company ID convertido a número:', companyIdNum);
    console.log('🏢 Empresas disponibles:', this.companies().map(c => ({ id: c.id, tipo: typeof c.id, razon_social: c.razon_social })));
    
    // Buscar por ID (comparando ambos como números)
    const selectedCompany = this.companies().find(c => Number(c.id) === Number(companyIdNum));
    console.log('🏢 Empresa encontrada:', selectedCompany);
    
    if (!selectedCompany) {
      console.error('❌ Empresa no encontrada en la lista');
      console.error('❌ Buscando ID:', companyIdNum, 'en empresas:', this.companies().map(c => c.id));
      this.error.set('Empresa no encontrada');
      this.isLoading.set(false);
      return;
    }
    
    // Buscar por razón social en minúsculas
    const companyName = selectedCompany.razon_social.toLowerCase().trim();
    console.log('🔍 Buscando inventario por company name:', companyName);
    
    this.inventoryService.getInventoryByCompany(companyName).subscribe({
      next: (inventories) => {
        console.log('✅ Inventarios recibidos:', inventories);
        console.log('✅ Tipo de dato recibido:', typeof inventories, Array.isArray(inventories));
        
        // Aplanar el inventario de todos los registros
        const allItems: any[] = [];
        
        if (Array.isArray(inventories)) {
          inventories.forEach((inv: any, index: number) => {
            console.log(`📋 Procesando inventario ${index}:`, inv);
            if (inv.inventory && Array.isArray(inv.inventory)) {
              // Normalizar cada item del inventario
              inv.inventory.forEach((item: any, itemIndex: number) => {
                const normalizedItem = {
                  ...item,
                  // Agregar campos normalizados
                  id: item['Service Tag Laptop'] || item.id || `item-${index}-${itemIndex}`,
                  name: item['Laptop Model '] || item.name || 'Producto sin nombre',
                  sku: item['Service Tag Laptop'] || item.sku || '',
                  serial: item['Service Tag Laptop'] || item.serial || '',
                  current_user: item['First Name'] && item['Last Name '] 
                    ? `${item['First Name']} ${item['Last Name ']}`.trim() 
                    : item.current_user || '',
                  location: item['City '] || item.location || '',
                  email: item['Email '] || item.email || '',
                  phone: item['Phone '] || item.phone || '',
                  address: item['Address'] || item.address || '',
                  tracking: item['Tracking Number Laptop'] || item.tracking || '',
                };
                allItems.push(normalizedItem);
              });
            }
          });
        }
        
        console.log('✅ Items totales normalizados:', allItems.length);
        console.log('✅ Primer item normalizado:', allItems[0]);
        console.log('📊 Actualizando signal inventory con', allItems.length, 'items');
        this.inventory.set(allItems);
        console.log('📊 Signal inventory actualizado. Valor actual:', this.inventory());
        console.log('📊 hasInventory():', this.hasInventory());
        console.log('📊 isCompanySelected():', this.isCompanySelected());
        this.isLoading.set(false);
        console.log('✅ isLoading establecido a false');
      },
      error: (err) => {
        console.error('❌ Error al cargar inventario:', err);
        this.error.set(`Error al cargar inventario: ${err.message}`);
        this.inventory.set([]);
        this.isLoading.set(false);
      }
    });
  }

  addProduct(product: any): void {
    console.log('➕ Agregando producto:', product);
    const current = this.selectedProducts();
    const productId = product.id || product._id || product.sku;
    const exists = current.find(p => (p.id || p._id || p.sku) === productId);
    
    if (!exists) {
      const newProduct = { ...product, quantity: 1, id: productId };
      this.selectedProducts.set([...current, newProduct]);
      console.log('✅ Producto agregado. Total seleccionados:', this.selectedProducts().length);
    } else {
      console.log('⚠️ Producto ya existe en la selección');
    }
  }

  removeProduct(productId: string): void {
    console.log('➖ Removiendo producto:', productId);
    const current = this.selectedProducts();
    this.selectedProducts.set(current.filter(p => (p.id || p._id || p.sku) !== productId));
    console.log('✅ Producto removido. Total seleccionados:', this.selectedProducts().length);
  }

  updateProductQuantity(productId: string, quantity: number): void {
    console.log('🔢 Actualizando cantidad del producto:', productId, 'a', quantity);
    const current = this.selectedProducts();
    const updated = current.map(p => 
      (p.id || p._id || p.sku) === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    );
    this.selectedProducts.set(updated);
  }

  jsonValidator(control: any) {
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  handleSubmit(): void {
    console.log('📤 Enviando formulario...');
    console.log('Form value:', this.createForm.value);
    console.log('Productos seleccionados:', this.selectedProducts());

    // Validaciones básicas
    if (!this.createForm.get('company_id')?.value) {
      this.error.set('Debes seleccionar una empresa.');
      return;
    }

    if (this.selectedProducts().length === 0) {
      this.error.set('Debes seleccionar al menos un producto.');
      return;
    }

    const formValue = this.createForm.value;
    
    // Validar campos según tipo de solicitud
    if (!formValue.order_id || formValue.order_id.length < 5) {
      this.error.set('El ID del pedido debe tener al menos 5 caracteres.');
      return;
    }

    if (!formValue.motivo || formValue.motivo.length < 10) {
      this.error.set('El motivo debe tener al menos 10 caracteres.');
      return;
    }

    if (this.requestType() === 'transfer') {
      if (!formValue.new_user || !formValue.new_location) {
        this.error.set('Para traslados debes completar el nuevo usuario y ubicación.');
        return;
      }
    }

    this.isLoading.set(true);
    this.error.set(null);

    const items = this.selectedProducts().map(p => ({
      product_id: p.id || p._id || p.product_id || p.sku,
      product_name: p.name || p.product_name,
      quantity: p.quantity,
      serial: p.serial || '',
    }));

    console.log('📦 Items a enviar:', items);

    const dto: CreateRmaDto = {
      order_id: formValue.order_id,
      motivo: formValue.motivo,
      items: items,
    };

    // Si es traslado, agregar información adicional al motivo
    if (this.requestType() === 'transfer') {
      dto.motivo = `[TRASLADO] ${formValue.motivo} | Nuevo Usuario: ${formValue.new_user} | Nueva Ubicación: ${formValue.new_location}`;
    }

    console.log('📨 DTO final:', dto);

    this.rmaService.createRma(dto).subscribe({
      next: (response) => {
        console.log('✅ RMA creada exitosamente:', response);
        this.isLoading.set(false);
        this.created.emit();
      },
      error: (err) => {
        console.error('❌ Error al crear RMA:', err);
        this.isLoading.set(false);
        this.error.set(`Error al crear la solicitud: ${err.error?.message || err.message}`);
      },
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
