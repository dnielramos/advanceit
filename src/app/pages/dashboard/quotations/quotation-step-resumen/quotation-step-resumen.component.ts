import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Company } from '../../../../services/companies.service';
import { User } from '../../../../models/user';

@Component({
  selector: 'app-quotation-step-resumen',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './quotation-step-resumen.component.html',
})
export class QuotationStepResumenComponent {
  @Input() quotationForm!: FormGroup;
  @Input() selectedCompany: Company | undefined;
  @Input() selectedUser: User | undefined;
  @Input() currentDate!: Date;
  @Input() details!: FormArray;
  @Input() subtotal!: number;
  @Input() totalDescuentos!: number;
  @Input() valorBaseDescuentos!: number;
  @Input() valorLogistica!: number;
  @Input() baseParaIVA!: number;
  @Input() valorIVA!: number;
  @Input() granTotal!: number;
  @Input() creditoDisponible!: number;
  @Input() creditoCubreOrden!: boolean;
  @Input() esOrdenDeContado!: boolean;
}
