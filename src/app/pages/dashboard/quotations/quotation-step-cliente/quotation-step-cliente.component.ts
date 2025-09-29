import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Company } from '../../../../services/companies.service';
import { User } from '../../../../models/user';
import { Role } from '../../../../services/auth.service';

@Component({
  selector: 'app-quotation-step-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quotation-step-cliente.component.html',
})
export class QuotationStepClienteComponent {
  @Input() quotationForm!: FormGroup;
  @Input() userRole!: Role | null;
  @Input() companies$!: Observable<Company[]>;
  @Input() users$!: Observable<User[]>;
  @Input() selectedCompany: Company | undefined;
  @Input() selectedUser: User | undefined;
  readonly Role = Role;

   // NUEVO: Creamos un emisor de eventos
  @Output() selectionChange = new EventEmitter<void>();

  // NUEVO: Creamos una función que simplemente emite el evento
  onSelectionMade(): void {
    this.selectionChange.emit();
  }
}
