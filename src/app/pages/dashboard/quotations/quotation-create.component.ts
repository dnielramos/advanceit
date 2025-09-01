import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CreateFullQuotationDto, CreateQuotationDetailDto } from '../../../models/quotation.types';
import { faPlus, faTrashAlt, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { QuotationService } from '../../../services/quotation.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

library.add(faPlus, faTrashAlt, faSave, faSpinner);

@Component({
  imports: [FontAwesomeModule, CommonModule, ReactiveFormsModule],
  selector: 'app-quotation-create',
  templateUrl: './quotation-create.component.html',
})
export class QuotationCreateComponent implements OnInit {
  @Output() onQuotationCreated = new EventEmitter<void>();

  quotationForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService
  ) {
    this.quotationForm = this.fb.group({
      company_id: ['', Validators.required],
      user_id: ['', Validators.required],
      validity_days: [15, [Validators.required, Validators.min(1)]],
      term: ['30 días', Validators.required],
      creation_mode: ['web'],
      created_by: ['usuario_web'], // Puedes obtener esto de un servicio de autenticación
      details: this.fb.array([], [Validators.required, Validators.min(1)]) // Debe haber al menos un detalle
    });
  }

  ngOnInit(): void {
    this.addDetail(); // Añade un ítem por defecto para iniciar
  }

  get details(): FormArray {
    return this.quotationForm.get('details') as FormArray;
  }

  createDetailFormGroup(): FormGroup {
    return this.fb.group({
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      subtotal: [0],
      taxes: [0]
    });
  }

  addDetail(): void {
    this.details.push(this.createDetailFormGroup());
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  onSubmit(): void {
    if (this.quotationForm.invalid) {
      console.error('Formulario no válido. Revise los campos.');
      return;
    }

    this.isLoading = true;
    const formValue = this.quotationForm.getRawValue();

    // Calcular subtotales y total antes de enviar
    const detailsWithSubtotal: CreateQuotationDetailDto[] = formValue.details.map((detail: any) => {
      const subtotal = (detail.quantity * detail.unit_price) - detail.discount;
      return { ...detail, subtotal };
    });

    const total = detailsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

    const payload: CreateFullQuotationDto = {
      quotation: {
        company_id: formValue.company_id,
        user_id: formValue.user_id,
        validity_days: formValue.validity_days,
        term: formValue.term,
        creation_mode: formValue.creation_mode,
        created_by: formValue.created_by,
        total: total // Añade el total calculado
      },
      details: detailsWithSubtotal
    };

    this.quotationService.create(payload).subscribe({
      next: (response) => {
        console.log('Cotización creada exitosamente:', response);
        this.isLoading = false;
        this.onQuotationCreated.emit();
        // Opcional: limpiar el formulario o cerrarlo
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear la cotización:', error);
      }
    });
  }
}
