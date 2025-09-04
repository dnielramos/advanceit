import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { Observable } from "rxjs";
import { CompaniesService, Company, CreateCompanyDto } from "../../../services/companies.service";
import { UiModalComponent } from "./ui-modal.component";

@Component({
  selector: 'company-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, UiModalComponent, FontAwesomeModule],
  template: `
  <ui-modal [title]="isEdit() ? 'Editar empresa' : 'Crear empresa'" (close)="close.emit()">
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">NIT</label>
          <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" formControlName="nit" placeholder="900123456-1" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Razón social</label>
          <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" formControlName="razon_social" placeholder="Mi Empresa S.A.S" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Industria</label>
          <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" formControlName="industria" placeholder="Tecnología" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-gray-600 mb-1">País</label>
            <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" formControlName="pais" placeholder="Colombia" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Ciudad</label>
            <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" formControlName="ciudad" placeholder="Bogotá" />
          </div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm text-gray-600 mb-1">Condiciones de pago</label>
          <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" formControlName="condiciones_pago" placeholder="30 días" />
        </div>
        <div class="grid grid-cols-3 gap-3 md:col-span-2">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Desc. base (%)</label>
            <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" type="number" formControlName="descuento_base" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Desc. especial (%)</label>
            <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" type="number" formControlName="descuento_especial" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Logística</label>
            <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" type="number" formControlName="valor_logistica" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 md:col-span-2">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Saldo crédito</label>
            <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" type="number" formControlName="saldo_credito" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">Saldo gastado</label>
            <input class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm" type="number" formControlName="saldo_gastado" />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button type="button" (click)="close.emit()" class="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 font-medium text-gray-700 shadow hover:bg-gray-200 transition"><fa-icon [icon]="['fas','xmark']"></fa-icon> Cancelar</button>
        <button type="submit" [disabled]="form.invalid || loading" class="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 font-medium text-white shadow-md hover:bg-purple-700 active:bg-purple-800 transition">
          <fa-icon *ngIf="loading" [icon]="['fas','spinner']" class="animate-spin mr-2"></fa-icon>
          {{ isEdit() ? 'Guardar cambios' : 'Crear empresa' }}
        </button>
      </div>
    </form>
  </ui-modal>
  `
})
export class CompanyEditModalComponent {
  private fb = inject(FormBuilder);
  private service = inject(CompaniesService);
  loading = false;

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

  onSubmit(){
    if(this.form.invalid){ this.form.markAllAsTouched(); return; }
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
