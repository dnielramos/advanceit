import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuotationService } from '../../../../services/quotation.service';
import { CreateFullQuotationDto } from '../../../../models/quotation.types';
import { faSave, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
library.add(faSave, faPlus, faTrashAlt);

@Component({
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  selector: 'app-quotation-form',
  templateUrl: './quotation-form.component.html',
})
export class QuotationFormComponent implements OnInit, OnDestroy {
  @Input() quotationId!: string;
  @Output() onSave = new EventEmitter<any>();

  quotationForm: FormGroup;
  private detailSubs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService
  ) {
    this.quotationForm = this.fb.group({
      quotation: this.fb.group({
        company_id: ['', Validators.required],
        user_id: ['', Validators.required],
        validity_days: [15, [Validators.required, Validators.min(1)]],
        term: ['', Validators.required],
        creation_mode: ['web', Validators.required],
        created_by: ['user_id_here', Validators.required],
        edited_by: [null]
      }),
      details: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadQuotationData();
  }

  ngOnDestroy(): void {
    this.detailSubs.forEach(s => s.unsubscribe());
  }

  get details(): FormArray {
    return this.quotationForm.get('details') as FormArray;
  }

  private createDetail(): FormGroup {
    const group = this.fb.group({
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      subtotal: [{ value: 0, disabled: true }],
      taxes: [0]
    });

    // Recalcular subtotal cuando cambien cantidad/precio/discount/taxes
    const sub = group.valueChanges.subscribe(val => {
      const qty = Number(val.quantity) || 0;
      const price = Number(val.unit_price) || 0;
      const discount = Number(val.discount) || 0;
      const taxes = Number(val.taxes) || 0;
      const subtotal = Math.max(qty * price - discount + taxes, 0);
      group.get('subtotal')?.setValue(subtotal, { emitEvent: false });
    });
    this.detailSubs.push(sub);

    return group;
  }

  addDetail(): void {
    this.details.push(this.createDetail());
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  private loadQuotationData(): void {
    this.quotationService.findOne(this.quotationId).subscribe({
      next: (q) => {
        // Patch de cabecera
        this.quotationForm.get('quotation')?.patchValue({
          company_id: q.company_id ?? '',
          user_id: q.user_id ?? '',
          validity_days: Number(q.validity_days) || 15,
          term: q.term ?? '',
          creation_mode: q.creation_mode ?? 'web',
          created_by: q.created_by ?? 'user_id_here',
          edited_by: 'user_id_here'
        });

        // Reset de detalles
        this.details.clear();

        (q.details ?? []).forEach(d => {
          const fg = this.createDetail();
          fg.patchValue({
            product_id: d.product_id ?? '',
            quantity: Number(d.quantity) || 1,
            unit_price: Number(d.unit_price), // API trae string -> number
            discount: Number((d as any).discount) || 0,
            taxes: Number((d as any).taxes) || 0
          });
          // disparar cálculo inicial (ya lo hace valueChanges)
          this.details.push(fg);
        });

        if (this.details.length === 0) {
          this.addDetail();
        }
      },
      error: (err) => {
        console.error('Error loading quotation for edit:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.quotationForm.invalid) return;

    const formValue = this.quotationForm.getRawValue();
    const payload: CreateFullQuotationDto = {
      quotation: {
        ...formValue.quotation,
        // aseguramos tipos correctos
        validity_days: Number(formValue.quotation.validity_days) || 1,
      },
      details: formValue.details.map((d: any) => ({
        product_id: d.product_id,
        quantity: Number(d.quantity) || 1,
        unit_price: Number(d.unit_price) || 0,
        discount: Number(d.discount) || 0,
        taxes: Number(d.taxes) || 0,
        subtotal: Number(d.subtotal) || 0
      }))
    };

    this.quotationService.update(this.quotationId, payload).subscribe({
      next: (res) => this.onSave.emit(res),
      error: (err) => console.error('Error updating quotation:', err)
    });
  }
}
