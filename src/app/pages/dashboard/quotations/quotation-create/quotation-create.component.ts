import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { QuotationService } from '../../../../services/quotation.service';
import {
  CreateFullQuotationDto,
  CreateQuotationDetailDto,
} from '../../../../models/quotation.types';
import {
  faPlus,
  faTrashAlt,
  faSave,
  faSpinner,
  faArrowLeft,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Observable } from 'rxjs';
import { CompaniesService } from '../../../../services/companies.service';
import { UsersService } from '../../../../services/users.service';
import { QuotationProductsComponent } from "../quotation-product.component";
import { AuthService } from '../../../../services/auth.service';

library.add(faPlus, faTrashAlt, faSave, faSpinner, faArrowLeft, faArrowRight);

@Component({
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, QuotationProductsComponent],
  selector: 'app-quotation-create',
  templateUrl: './quotation-create.component.html',
})
export class QuotationCreateComponent implements OnInit {
  @Output() onQuotationCreated = new EventEmitter<void>();

  users$: Observable<any[]> | undefined; // Observable para la lista de usuarios
  companies$: Observable<any[]> | undefined; // Observable para la lista de empresas (asumiendo un servicio similar)

  quotationForm: FormGroup;
  isLoading = false;
  currentStep = 1;
  userId: string | null = null;
  isProductModalVisible = false; // Estado del modal

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private companiesService: CompaniesService,
    private userService: UsersService,
    private authService: AuthService
  ) {

    this.userId = this.authService.getUserId();


    this.quotationForm = this.fb.group({
      company_id: ['', Validators.required],
      user_id: ['', Validators.required],
      validity_days: [15, [Validators.required, Validators.min(1), Validators.max(30)]],
      term: ['30 días', Validators.required],
      creation_mode: ['web'],
      created_by: [this.userId],
      details: this.fb.array([], [Validators.required, Validators.min(1)]),
    });
  }

  ngOnInit(): void {
    this.users$ = this.userService.getUsers();
    this.companies$ = this.companiesService.findAll();
  }

  // Métodos para abrir y cerrar el modal
  openProductModal(): void {
    this.isProductModalVisible = true;
  }

  onModalClose(): void {
    this.isProductModalVisible = false;
  }

  // Método para manejar el producto seleccionado
  onProductSelected(product: any): void {
    console.log('Producto agregado:', product);
    const detailGroup = this.fb.group({
      product_id: [product.id, Validators.required],
      product_name: [product.nombre], // Opcional, para mostrar en la UI
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [
        product.precio,
        [Validators.required, Validators.min(0)],
      ],
      discount: [0],
      taxes: [0],
    });
    this.details.push(detailGroup);
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
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
      taxes: [0],
    });
  }

  addDetail(): void {
    this.details.push(this.createDetailFormGroup());
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep++;
    } else {
      // Marcar los campos del paso actual como "tocados" para mostrar errores
      if (this.currentStep === 1) {
        this.markFormGroupTouched(this.quotationForm);
      } else if (this.currentStep === 2) {
        this.markFormArrayTouched(this.details);
      }
    }
  }

  prevStep(): void {
    this.currentStep--;
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return (
          (this.quotationForm.get('company_id')?.valid &&
            this.quotationForm.get('user_id')?.valid &&
            this.quotationForm.get('validity_days')?.valid &&
            this.quotationForm.get('term')?.valid) ||
          false
        );
      case 2:
        return this.details.valid && this.details.length > 0;
      case 3:
        return this.quotationForm.valid;
      default:
        return false;
    }
  }

  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  markFormArrayTouched(formArray: FormArray): void {
    formArray.controls.forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onSubmit(): void {
    if (this.currentStep !== 3 || this.quotationForm.invalid) {
      console.error('Formulario no válido para el envío.');
      this.markFormGroupTouched(this.quotationForm);
      return;
    }

    this.isLoading = true;
    const formValue = this.quotationForm.getRawValue();

    const detailsWithSubtotal: CreateQuotationDetailDto[] =
      formValue.details.map((detail: any) => {
        const subtotal = detail.quantity * detail.unit_price - detail.discount;
        return {
          product_id: detail.product_id,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          discount: detail.discount,
          subtotal: subtotal,
          taxes: 0,
        };
      });

    const payload: CreateFullQuotationDto = {
      quotation: {
        company_id: formValue.company_id,
        user_id: formValue.user_id,
        validity_days: formValue.validity_days,
        term: formValue.term,
        creation_mode: formValue.creation_mode,
        created_by: formValue.created_by,
      },
      details: detailsWithSubtotal,
    };

    this.quotationService.create(payload).subscribe({
      next: (response) => {
        console.log('Cotización creada exitosamente:', response);
        this.isLoading = false;
        this.onQuotationCreated.emit();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear la cotización:', error);
      },
    });
  }

  // onSubmit(): void {
  //   if (this.currentStep !== 3 || this.quotationForm.invalid) {
  //     console.error('Formulario no válido para el envío.');
  //     this.markFormGroupTouched(this.quotationForm);
  //     return;
  //   }

  //   this.isLoading = true;
  //   const formValue = this.quotationForm.getRawValue();

  //   // Calcular subtotales y total antes de enviar
  //   const detailsWithSubtotal: CreateQuotationDetailDto[] =
  //     formValue.details.map((detail: any) => {
  //       const subtotal = detail.quantity * detail.unit_price - detail.discount;
  //       return { ...detail, subtotal, taxes: 0 }; // Asegúrate de incluir el campo taxes
  //     });

  //   const total = detailsWithSubtotal.reduce(
  //     (sum, item) => sum + item.subtotal,
  //     0
  //   );

  //   const payload: CreateFullQuotationDto = {
  //     quotation: {
  //       company_id: formValue.company_id,
  //       user_id: formValue.user_id,
  //       validity_days: formValue.validity_days,
  //       term: formValue.term,
  //       creation_mode: formValue.creation_mode,
  //       created_by: formValue.created_by,
  //     },
  //     details: detailsWithSubtotal,
  //   };

  //   this.quotationService.create(payload).subscribe({
  //     next: (response) => {
  //       console.log('Cotización creada exitosamente:', response);
  //       this.isLoading = false;
  //       this.onQuotationCreated.emit();
  //     },
  //     error: (error) => {
  //       this.isLoading = false;
  //       console.error('Error al crear la cotización:', error);
  //     },
  //   });
  // }
}
