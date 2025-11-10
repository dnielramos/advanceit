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
      order_id: ['', [Validators.required, Validators.minLength(5)]],
      motivo: ['', [Validators.required, Validators.minLength(10)]],
      // Para traslados
      new_user: [''],
      new_location: [''],
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
    
    // Escuchar cambios en el tipo de solicitud
    this.createForm.get('request_type')?.valueChanges.subscribe(type => {
      this.requestType.set(type);
      this.updateValidators();
    });
    
    // Escuchar cambios en la empresa seleccionada
    this.createForm.get('company_id')?.valueChanges.subscribe(companyId => {
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
    this.isLoading.set(true);
    this.companiesService.findAll().subscribe({
      next: (companies) => {
        this.companies.set(companies.filter(c => c.estado === 'activo'));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(`Error al cargar empresas: ${err.message}`);
        this.isLoading.set(false);
      }
    });
  }

  loadInventoryByCompany(companyId: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    // Buscar la empresa seleccionada para obtener su razón social
    const selectedCompany = this.companies().find(c => c.id === companyId);
    if (!selectedCompany) {
      this.error.set('Empresa no encontrada');
      this.isLoading.set(false);
      return;
    }
    
    this.inventoryService.getInventoryByCompany(selectedCompany.razon_social).subscribe({
      next: (inventories) => {
        // Aplanar el inventario de todos los registros
        const allItems: any[] = [];
        inventories.forEach((inv: any) => {
          if (inv.inventory && Array.isArray(inv.inventory)) {
            allItems.push(...inv.inventory);
          }
        });
        this.inventory.set(allItems);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(`Error al cargar inventario: ${err.message}`);
        this.inventory.set([]);
        this.isLoading.set(false);
      }
    });
  }

  addProduct(product: any): void {
    const current = this.selectedProducts();
    const exists = current.find(p => p.id === product.id);
    
    if (!exists) {
      this.selectedProducts.set([...current, { ...product, quantity: 1 }]);
    }
  }

  removeProduct(productId: string): void {
    const current = this.selectedProducts();
    this.selectedProducts.set(current.filter(p => p.id !== productId));
  }

  updateProductQuantity(productId: string, quantity: number): void {
    const current = this.selectedProducts();
    const updated = current.map(p => 
      p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
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
    if (this.createForm.invalid) {
      this.error.set('Formulario inválido. Revisa los campos.');
      return;
    }

    if (this.selectedProducts().length === 0) {
      this.error.set('Debes seleccionar al menos un producto.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.createForm.value;
    const items = this.selectedProducts().map(p => ({
      product_id: p.id || p.product_id || p.sku,
      product_name: p.name || p.product_name,
      quantity: p.quantity,
      serial: p.serial || '',
    }));

    const dto: CreateRmaDto = {
      order_id: formValue.order_id,
      motivo: formValue.motivo,
      items: items,
    };

    // Si es traslado, agregar información adicional al motivo
    if (this.requestType() === 'transfer') {
      dto.motivo = `[TRASLADO] ${formValue.motivo} | Nuevo Usuario: ${formValue.new_user} | Nueva Ubicación: ${formValue.new_location}`;
    }

    this.rmaService.createRma(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.created.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Error al crear la solicitud: ${err.error?.message || err.message}`);
      },
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
