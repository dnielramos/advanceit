import { Component, EventEmitter, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { RmasService } from '../../../../services/rmas.service';
import { CreateRmaDto } from '../../../../models/rma.model';
import { CompaniesService, Company } from '../../../../services/companies.service';
import { CompanyInventoriesService } from '../../../../services/company-inventories.service';

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

  @Output() created = new EventEmitter<void>();

  faSpinner = faSpinner;
  faPaperPlane = faPaperPlane;

  isLoading = signal(false);
  error = signal<string | null>(null);
  companies = signal<Company[]>([]);
  inventory = signal<any[]>([]);
  selectedProducts = signal<any[]>([]);
  requestType = signal<'rma' | 'transfer'>('rma');
  private companySelected = signal<boolean>(false);

  isCompanySelected = computed(() => this.companySelected());
  hasInventory = computed(() => this.inventory().length > 0);

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
    this.loadCompanies();

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

    const companyName = selectedCompany.razon_social.toString().toLowerCase().trim();
    this.inventoryService.getInventoryByCompany(companyName).subscribe({
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
    }
  }

  removeProduct(productId: string): void {
    const current = this.selectedProducts();
    this.selectedProducts.set(current.filter((p: any) => (p.id || p._id || p.sku) !== productId));
  }

  updateProductQuantity(productId: string, quantity: number): void {
    const current = this.selectedProducts();
    const updated = current.map((p: any) =>
      (p.id || p._id || p.sku) === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    );
    this.selectedProducts.set(updated);
  }

  handleSubmit(): void {
    if (!this.createForm.get('company_id')?.value) {
      this.error.set('Debes seleccionar una empresa.');
      return;
    }
    if (this.selectedProducts().length === 0) {
      this.error.set('Debes seleccionar al menos un producto.');
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
        this.created.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Error al crear la solicitud: ${err.error?.message || err.message}`);
      },
    });
  }
}
