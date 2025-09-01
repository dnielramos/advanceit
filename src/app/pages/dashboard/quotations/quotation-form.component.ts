import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuotationService } from '../../../services/quotation.service';
import { CreateFullQuotationDto, Quotation, QuotationDetail } from '../../../models/quotation.types';
import { faSave, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faSave, faPlus, faTrashAlt);

@Component({
  imports: [FormsModule, ReactiveFormsModule],
  selector: 'app-quotation-form',
  templateUrl: './quotation-form.component.html',
})
export class QuotationFormComponent implements OnInit {
  @Input() quotationId: string | null = null;
  @Input() isEditMode = false;
  @Output() onSave = new EventEmitter<any>();

  quotationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService
  ) {
    this.quotationForm = this.fb.group({
      quotation: this.fb.group({
        company_id: ['', Validators.required],
        user_id: ['', Validators.required],
        validity_days: [15, Validators.required],
        term: ['', Validators.required],
        creation_mode: ['web', Validators.required],
        created_by: ['user_id_here', Validators.required],
        edited_by: [null]
      }),
      details: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.quotationId) {
      this.loadQuotationData();
    } else {
      this.addDetail();
    }
  }

  get details(): FormArray {
    return this.quotationForm.get('details') as FormArray;
  }

  createDetail(): FormGroup {
    return this.fb.group({
      product_id: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      subtotal: [{ value: 0, disabled: true }],
      taxes: [0]
    });
  }

  addDetail(): void {
    this.details.push(this.createDetail());
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  loadQuotationData(): void {
    if (this.quotationId) {
      this.quotationService.findOne(this.quotationId).subscribe({
        next: (quotationData) => {
          this.quotationForm.patchValue({
            quotation: {
              company_id: quotationData.company_id,
              user_id: quotationData.user_id,
              validity_days: quotationData.validity_days,
              term: quotationData.term,
              edited_by: 'user_id_here'
            }
          });
          this.details.clear();
          quotationData.details.forEach(d => {
            const detailFormGroup = this.createDetail();
            detailFormGroup.patchValue(d);
            this.details.push(detailFormGroup);
          });
        },
        error: (err) => {
          console.error('Error loading quotation for edit:', err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.quotationForm.valid) {
      const formValue = this.quotationForm.getRawValue();
      const payload: CreateFullQuotationDto = {
        quotation: formValue.quotation,
        details: formValue.details
      };

      if (this.isEditMode && this.quotationId) {
        this.quotationService.update(this.quotationId, payload).subscribe({
          next: (res) => {
            this.onSave.emit(res);
          },
          error: (err) => {
            console.error('Error updating quotation:', err);
          }
        });
      } else {
        this.quotationService.create(payload).subscribe({
          next: (res) => {
            this.onSave.emit(res);
          },
          error: (err) => {
            console.error('Error creating quotation:', err);
          }
        });
      }
    }
  }
}
