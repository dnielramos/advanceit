import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { Observable } from "rxjs";
import { CompaniesService, Company, CreateCompanyDto } from "../../../services/companies.service";
import { 
  faTimes, 
  faBuilding, 
  faMapMarkerAlt, 
  faMoneyBillWave, 
  faPercentage, 
  faTruck, 
  faSave, 
  faSpinner,
  faIndustry
} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'company-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FontAwesomeModule],
  template: `
  <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn" (click)="onOverlayClick($event)">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate__animated animate__zoomIn flex flex-col">
      
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <div class="bg-purple-100 p-3 rounded-xl text-purple-600">
            <fa-icon [icon]="faBuilding" class="text-xl"></fa-icon>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ isEdit() ? 'Editar Empresa' : 'Registrar Nueva Empresa' }}</h2>
            <p class="text-sm text-gray-500">Complete la información solicitada a continuación</p>
          </div>
        </div>
        <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
          <fa-icon [icon]="faTimes" class="text-lg"></fa-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8">
          
          <!-- Sección 1: Información Básica -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
              <fa-icon [icon]="faBuilding" class="text-purple-500"></fa-icon>
              Información Básica
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">NIT <span class="text-red-500">*</span></label>
                <input class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" 
                       formControlName="nit" placeholder="Ej: 900123456-1" 
                       [class.border-red-300]="isFieldInvalid('nit')" />
                <p *ngIf="isFieldInvalid('nit')" class="text-xs text-red-500 mt-1">El NIT es requerido (mín. 5 caracteres)</p>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Razón Social <span class="text-red-500">*</span></label>
                <input class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" 
                       formControlName="razon_social" placeholder="Ej: Tech Solutions S.A.S"
                       [class.border-red-300]="isFieldInvalid('razon_social')" />
                 <p *ngIf="isFieldInvalid('razon_social')" class="text-xs text-red-500 mt-1">La razón social es requerida</p>
              </div>
              <div class="space-y-1 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Industria <span class="text-red-500">*</span></label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <fa-icon [icon]="faIndustry"></fa-icon>
                  </div>
                  <input class="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" 
                         formControlName="industria" placeholder="Ej: Tecnología, Salud, Educación..."
                         [class.border-red-300]="isFieldInvalid('industria')" />
                </div>
              </div>
            </div>
          </div>

          <!-- Sección 2: Ubicación -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
              <fa-icon [icon]="faMapMarkerAlt" class="text-purple-500"></fa-icon>
              Ubicación
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">País <span class="text-red-500">*</span></label>
                <input class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" 
                       formControlName="pais" placeholder="Ej: Colombia"
                       [class.border-red-300]="isFieldInvalid('pais')" />
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Ciudad <span class="text-red-500">*</span></label>
                <input class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" 
                       formControlName="ciudad" placeholder="Ej: Bogotá D.C."
                       [class.border-red-300]="isFieldInvalid('ciudad')" />
              </div>
            </div>
          </div>

          <!-- Sección 3: Información Financiera -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
              <fa-icon [icon]="faMoneyBillWave" class="text-purple-500"></fa-icon>
              Configuración Financiera
            </h3>
            
            <div class="space-y-1">
               <label class="block text-sm font-medium text-gray-700">Condiciones de Pago <span class="text-red-500">*</span></label>
               <input class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" 
                      formControlName="condiciones_pago" placeholder="Ej: 30 días, Contado, 60 días"
                      [class.border-red-300]="isFieldInvalid('condiciones_pago')" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Desc. Base (%)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <fa-icon [icon]="faPercentage"></fa-icon>
                  </div>
                  <input type="number" class="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                         formControlName="descuento_base" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Desc. Especial (%)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <fa-icon [icon]="faPercentage"></fa-icon>
                  </div>
                  <input type="number" class="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                         formControlName="descuento_especial" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Logística</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <fa-icon [icon]="faTruck"></fa-icon>
                  </div>
                  <input type="number" class="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                         formControlName="valor_logistica" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Saldo Crédito</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <span class="text-xs font-bold">$</span>
                  </div>
                  <input type="number" class="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                         formControlName="saldo_credito" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="block text-sm font-medium text-gray-700">Saldo Gastado</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <span class="text-xs font-bold">$</span>
                  </div>
                  <input type="number" class="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                         formControlName="saldo_gastado" />
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
        <button type="button" (click)="close.emit()" 
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200">
          Cancelar
        </button>
        <button type="button" (click)="onSubmit()" [disabled]="form.invalid || loading" 
                class="px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <fa-icon *ngIf="loading" [icon]="faSpinner" class="animate-spin"></fa-icon>
          <fa-icon *ngIf="!loading" [icon]="faSave"></fa-icon>
          {{ isEdit() ? 'Guardar Cambios' : 'Registrar Empresa' }}
        </button>
      </div>

    </div>
  </div>
  `
})
export class CompanyEditModalComponent {
  private fb = inject(FormBuilder);
  private service = inject(CompaniesService);
  loading = false;

  // Icons
  faTimes = faTimes;
  faBuilding = faBuilding;
  faMapMarkerAlt = faMapMarkerAlt;
  faMoneyBillWave = faMoneyBillWave;
  faPercentage = faPercentage;
  faTruck = faTruck;
  faSave = faSave;
  faSpinner = faSpinner;
  faIndustry = faIndustry;

  @Input() company?: Company;
  @Output() saved = new EventEmitter<Company>();
  @Output() close = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    nit: ['', [Validators.required, Validators.minLength(5)]],
    razon_social: ['', [Validators.required, Validators.minLength(3)]],
    industria: ['', Validators.required],
    pais: ['', Validators.required],
    ciudad: ['', Validators.required],
    condiciones_pago: ['', Validators.required],
    descuento_base: [0, [Validators.required, Validators.min(0)]],
    descuento_especial: [0, [Validators.required, Validators.min(0)]],
    saldo_credito: [0, [Validators.required, Validators.min(0)]],
    saldo_gastado: [0, [Validators.required, Validators.min(0)]],
    valor_logistica: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(){
    if(this.company){
      const { id, estado, fecha_creacion, fecha_actualizacion, ...editable } = this.company;
      this.form.patchValue(editable);
    }
  }

  isEdit(){ return !!this.company; }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSubmit(){
    if(this.form.invalid){ 
      this.form.markAllAsTouched(); 
      return; 
    }
    this.loading = true;
    const payload = this.form.value as CreateCompanyDto;

    const obs: Observable<Company> = this.company
      ? this.service.update(this.company.id, payload)
      : this.service.create(payload);

    obs.subscribe({
      next: (c) => { this.loading = false; this.saved.emit(c); },
      error: _ => { this.loading = false; }
    });
  }
}
