import { Component, EventEmitter, OnInit, Output, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane, faSpinner, faArrowLeft, faArrowRight, faHome, faBox, faCheck, faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { RmasService } from '../../../../services/rmas.service';
import { CreateRmaDto } from '../../../../models/rma.model';
import { CompaniesService, Company } from '../../../../services/companies.service';
import { CompanyInventoriesService } from '../../../../services/company-inventories.service';
import { AuthService, Role } from '../../../../services/auth.service';
import { UsersService } from '../../../../services/users.service';

@Component({
  selector: 'app-create-rma-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './create-rma.component.html',
})
export class CreateRmaComponent implements OnInit {
  private readonly rmaService = inject(RmasService);
  private readonly fb = inject(FormBuilder);
  private readonly companiesService = inject(CompaniesService);
  private readonly inventoryService = inject(CompanyInventoriesService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);

  @Output() created = new EventEmitter<void>();

  faSpinner = faSpinner;
  faPaperPlane = faPaperPlane;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faHome = faHome;
  faBox = faBox;
  faCheck = faCheck;
  faSearch = faSearch;
  faInfoCircle = faInfoCircle;

  isLoading = signal(false);
  error = signal<string | null>(null);
  toast = signal<string | null>(null);
  companies = signal<Company[]>([]);
  inventory = signal<any[]>([]);
  selectedProducts = signal<any[]>([]);
  requestType = signal<'rma' | 'transfer'>('rma');
  private companySelected = signal<boolean>(false);
  searchTerm = signal<string>('');

  isCompanySelected = computed(() => this.companySelected());
  hasInventory = computed(() => this.inventory().length > 0);
  
  // Filtered inventory based on search term
  filteredInventory = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.inventory();
    
    return this.inventory().filter((product: any) => {
      const name = (product.name || product.product_name || '').toLowerCase();
      const sku = (product.sku || product.id || product._id || '').toLowerCase();
      const serial = (product.serial || '').toLowerCase();
      const user = (product.current_user || '').toLowerCase();
      const location = (product.location || '').toLowerCase();
      
      return name.includes(term) || 
             sku.includes(term) || 
             serial.includes(term) ||
             user.includes(term) ||
             location.includes(term);
    });
  });

  // --- Stepper State ---
  currentStep = 1;

  createForm: FormGroup;

  constructor() {
    this.createForm = this.fb.group({
      request_type: ['rma', [Validators.required]],
      company_id: ['', [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(10)]],
      new_user: [''],
      new_location: [''],
    });
  }

  ngOnInit(): void {
    // Setup form listeners first
    this.createForm.get('request_type')?.valueChanges.subscribe((type) => {
      this.requestType.set(type);
      this.updateValidators();
    });

    this.createForm.get('company_id')?.valueChanges.subscribe((companyId) => {
      const hasSelection = companyId !== null && companyId !== undefined && companyId !== '';
      this.companySelected.set(!!hasSelection);
      if (hasSelection) {
        this.loadInventoryByCompany(companyId as any);
      } else {
        this.inventory.set([]);
        this.selectedProducts.set([]);
      }
      this.saveDraft();
    });

    // Persistir borrador en cambios
    this.createForm.valueChanges.subscribe(() => this.saveDraft());

    // Initialize based on role
    this.initializeBasedOnRole();
  }

  private initializeBasedOnRole(): void {
    const userRole = this.authService.getCurrentUserRole();
    const userId = this.authService.getUserId();

    if (!userId) {
      this.error.set('No se pudo obtener la información del usuario');
      return;
    }

    // Load companies first
    this.loadCompanies();

    if (userRole === Role.Admin) {
      // Admin: Clear company selection and don't auto-load inventory
      // Set company_id to empty string explicitly
      this.createForm.patchValue({ company_id: '' }, { emitEvent: false });
      this.companySelected.set(false);
      // Restore other draft fields (but skip company for admin)
      setTimeout(() => this.restoreDraft(true), 500); // Pass true to skip company restoration
    } else {
      // Non-admin: Load user's company and auto-select
      this.usersService.getUserById(userId).subscribe({
        next: (user: any) => {
          if (user.company) {
            // Wait for companies to load
            const checkCompaniesLoaded = setInterval(() => {
              if (this.companies().length > 0) {
                clearInterval(checkCompaniesLoaded);
                // Find company by name or id
                const userCompany = this.companies().find((c: any) => 
                  c.razon_social?.toLowerCase() === user.company?.toLowerCase() ||
                  c.id === user.company
                );
                if (userCompany) {
                  // Set company in form without emitting to avoid draft save
                  this.createForm.patchValue({ company_id: userCompany.id }, { emitEvent: false });
                  this.companySelected.set(true);
                  this.loadInventoryByCompany(userCompany.id);
                } else {
                  this.error.set('No se encontró la empresa asociada al usuario');
                }
                // Then restore draft if exists (won't override company)
                this.restoreDraft(false);
              }
            }, 100);
          } else {
            // No company associated, restore draft
            setTimeout(() => this.restoreDraft(false), 500);
          }
        },
        error: (err) => {
          this.error.set(`Error al cargar datos del usuario: ${err.message}`);
          setTimeout(() => this.restoreDraft(false), 500);
        }
      });
    }
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
    this.error.set(null);
    this.companiesService.findAll().subscribe({
      next: (companies) => {
        const activeCompanies = (companies || []).filter((c: any) =>
          c?.estado && c.estado.toString().toLowerCase().trim() === 'activo'
        );
        this.companies.set(activeCompanies.length ? activeCompanies : companies);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(`Error al cargar empresas: ${err.message}`);
        this.isLoading.set(false);
      },
    });
  }

  loadInventoryByCompany(companyId: string | number): void {
    this.isLoading.set(true);
    this.error.set(null);

    const companyIdNum = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
    const selectedCompany = this.companies().find((c: any) => Number(c.id) === Number(companyIdNum));
    if (!selectedCompany) {
      this.error.set('Empresa no encontrada');
      this.isLoading.set(false);
      return;
    }

    // Usar ID de la empresa en lugar de nombre, ya que el backend espera el ID
    this.inventoryService.getInventoryByCompany(selectedCompany.id).subscribe({
      next: (inventories) => {
        const allItems: any[] = [];
        if (Array.isArray(inventories)) {
          inventories.forEach((inv: any, index: number) => {
            if (inv.inventory && Array.isArray(inv.inventory)) {
              inv.inventory.forEach((item: any, itemIndex: number) => {
                const normalizedItem = {
                  ...item,
                  id: item['Service Tag Laptop'] || item.id || `item-${index}-${itemIndex}`,
                  name: item['Laptop Model '] || item.name || 'Producto sin nombre',
                  sku: item['Service Tag Laptop'] || item.sku || '',
                  serial: item['Service Tag Laptop'] || item.serial || '',
                  current_user:
                    (item['First Name'] && item['Last Name ']
                      ? `${item['First Name']} ${item['Last Name ']}`.trim()
                      : item.current_user) || '',
                  location: item['City '] || item.location || '',
                };
                allItems.push(normalizedItem);
              });
            }
          });
        }
        this.inventory.set(allItems);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(`Error al cargar inventario: ${err.message}`);
        this.inventory.set([]);
        this.isLoading.set(false);
      },
    });
  }

  addProduct(product: any): void {
    const current = this.selectedProducts();
    const productId = product.id || product._id || product.sku;
    const exists = current.find((p: any) => (p.id || p._id || p.sku) === productId);
    if (!exists) {
      this.selectedProducts.set([...current, { ...product, quantity: 1, id: productId }]);
      this.saveDraft();
    }
  }

  removeProduct(productId: string): void {
    const current = this.selectedProducts();
    this.selectedProducts.set(current.filter((p: any) => (p.id || p._id || p.sku) !== productId));
    this.saveDraft();
  }

  updateProductQuantity(productId: string, quantity: number): void {
    const current = this.selectedProducts();
    const updated = current.map((p: any) =>
      (p.id || p._id || p.sku) === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    );
    this.selectedProducts.set(updated);
    this.saveDraft();
  }

  // --- Stepper Methods ---

  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep++;
    } else {
      this.createForm.markAllAsTouched();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1: // Tipo y Empresa
        return (
          this.createForm.get('request_type')?.valid &&
          this.createForm.get('company_id')?.valid
        ) ?? false;
      case 2: // Productos
        return this.selectedProducts().length > 0;
      case 3: // Motivo y Detalles
        return this.createForm.valid;
      default:
        return false;
    }
  }

  handleSubmit(): void {
    if (!this.createForm.valid || this.selectedProducts().length === 0) {
      this.error.set('Por favor completa todos los campos requeridos.');
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.value;
    if (!formValue.motivo || formValue.motivo.length < 10) {
      this.error.set('El motivo debe tener al menos 10 caracteres.');
      return;
    }
    if (this.requestType() === 'transfer' && (!formValue.new_user || !formValue.new_location)) {
      this.error.set('Para traslados debes completar el nuevo usuario y ubicación.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const items = this.selectedProducts().map((p: any) => ({
      product_id: p.id || p._id || p.product_id || p.sku,
      product_name: p.name || p.product_name,
      quantity: p.quantity,
      serial: p.serial || '',
    }));

    const dto: CreateRmaDto = {
      order_id: 'system',
      motivo: formValue.motivo,
      items,
    };
    if (this.requestType() === 'transfer') {
      dto.motivo = `[TRASLADO] ${formValue.motivo} | Nuevo Usuario: ${formValue.new_user} | Nueva Ubicación: ${formValue.new_location}`;
    }

    this.rmaService.createRma(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Limpiar borrador y notificar
        this.clearDraft();
        this.toast.set('Solicitud creada correctamente');
        setTimeout(() => {
          this.toast.set(null);
          this.router.navigate(['/dashboard/solicitudes']);
        }, 1200);
        this.created.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Error al crear la solicitud: ${err.error?.message || err.message}`);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/solicitudes']);
  }

  // Contador seleccionados
  selectedCount(): number {
    return this.selectedProducts().length;
  }
  
  // Clear search term
  clearSearch(): void {
    this.searchTerm.set('');
  }

  // Persistencia de borrador en localStorage
  private draftKey = 'create_rma_draft_v1';

  private saveDraft(): void {
    try {
      const data = {
        form: this.createForm.value,
        requestType: this.requestType(),
        selectedProducts: this.selectedProducts(),
      };
      localStorage.setItem(this.draftKey, JSON.stringify(data));
    } catch { /* noop */ }
  }

  private restoreDraft(skipCompany: boolean = false): void {
    try {
      const raw = localStorage.getItem(this.draftKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data?.form) {
        const patchData: any = {
          request_type: data.form.request_type || 'rma',
          motivo: data.form.motivo || '',
          new_user: data.form.new_user || '',
          new_location: data.form.new_location || '',
        };
        
        // Only restore company_id if not skipping (i.e., not admin)
        if (!skipCompany) {
          patchData.company_id = data.form.company_id || '';
        }
        
        this.createForm.patchValue(patchData, { emitEvent: false });
        this.requestType.set(data.requestType || 'rma');
      }
      if (Array.isArray(data?.selectedProducts)) {
        this.selectedProducts.set(data.selectedProducts);
      }
      
      // Only trigger inventory load if company was restored and we're not skipping
      if (!skipCompany) {
        const cid = this.createForm.get('company_id')?.value;
        if (cid) {
          this.companySelected.set(true);
          this.loadInventoryByCompany(cid);
        }
      }
    } catch { /* noop */ }
  }

  private clearDraft(): void {
    try { localStorage.removeItem(this.draftKey); } catch { /* noop */ }
  }
}
