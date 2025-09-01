import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { UiModalComponent } from "./ui-modal.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CompaniesService, Company } from "../../../services/companies.service";

// ===== Detalle (listar por ID) =====
@Component({
selector: 'company-detail-modal',
standalone: true,
imports: [CommonModule, UiModalComponent, FontAwesomeModule],
template: `
<ui-modal [title]="'Detalle de empresa'" (close)="onClose()">
<ng-container *ngIf="loading; else content">
<div class="flex items-center gap-2 text-gray-600"><fa-icon [icon]="['fas','spinner']" class="animate-spin"></fa-icon> Cargando...</div>
</ng-container>
<ng-template #content>
<div *ngIf="company; else notFound" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
<div class="bg-gray-50 rounded-xl p-4">
<p class="font-medium text-gray-500">Razón social</p>
<p class="text-gray-900">{{ company.razon_social }}</p>
</div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">NIT</p><p class="text-gray-900">{{ company.nit }}</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Industria</p><p class="text-gray-900">{{ company.industria }}</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Ubicación</p><p class="text-gray-900">{{ company.ciudad }}, {{ company.pais }}</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Condiciones de pago</p><p class="text-gray-900">{{ company.condiciones_pago }}</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Descuento base</p><p class="text-gray-900">{{ company.descuento_base }}%</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Descuento especial</p><p class="text-gray-900">{{ company.descuento_especial }}%</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Saldo crédito</p><p class="text-gray-900">{{ company.saldo_credito | number:'1.0-0' }}</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Saldo gastado</p><p class="text-gray-900">{{ company.saldo_gastado | number:'1.0-0' }}</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Logística</p><p class="text-gray-900">{{ company.valor_logistica | number:'1.0-0' }}</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Estado</p><span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full" [class.bg-green-500]="company.estado==='ACTIVO'" [class.bg-gray-400]="company.estado!=='ACTIVO'"></span>{{ company.estado }}</span></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Creación</p><p class="text-gray-900">{{ company.fecha_creacion | date:'medium' }}</p></div>
<div class="bg-gray-50 rounded-xl p-4"><p class="font-medium text-gray-500">Actualización</p><p class="text-gray-900">{{ company.fecha_actualizacion | date:'medium' }}</p></div>
</div>
<ng-template #notFound>
<div class="text-center text-gray-600">No se encontró la empresa.</div>
</ng-template>
</ng-template>
</ui-modal>
`,
styles: []
})
export class CompanyDetailModalComponent {
private service = inject(CompaniesService);
loading = false;
company?: Company;
@Input() id?: string;
@Output() closed = new EventEmitter<void>();


ngOnInit(){
if(this.id){ this.fetch(this.id); }
}


fetch(id: string){
this.loading = true;
this.service.findById(id).subscribe({
next: c => { this.company = c; this.loading = false; },
error: _ => { this.loading = false; this.company = undefined; }
});
}
onClose(){ this.closed.emit(); }
}
