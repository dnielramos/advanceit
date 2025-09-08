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
import { AuthService } from '../../../../services/auth.service';
import { CreationMode } from '../../../../models/creation-mode';
import { Router } from '@angular/router';
import { AngularToastifyModule, ToastService } from 'angular-toastify';
import { CartService } from '../../../../services/cart.service';

library.add(faPlus, faTrashAlt, faSave, faSpinner, faArrowLeft, faArrowRight);

@Component({
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, AngularToastifyModule],
  selector: 'app-quotation-create',
  templateUrl: './quotation-create.component.html',
})
export class QuotationCreateComponent implements OnInit {
  @Output() onQuotationCreated = new EventEmitter<void>();

  users$: Observable<any[]> | undefined; // Observable para la lista de usuarios
  companies$: Observable<any[]> | undefined; // Observable para la lista de empresas (asumiendo un servicio similar)

  order: any;
  navigation: any;

  quotationForm: FormGroup;
  isLoading = false;
  currentStep = 1;
  userId: string | null = null;
  isProductModalVisible = false; // Estado del modal

  hoy: string = new Date().toISOString().split('T')[0];
  expiration_date: string = new Date().toISOString().split('T')[0];

  user: any = '';
  company: any = '';
  totalQuotation: number = 0;

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private companiesService: CompaniesService,
    private userService: UsersService,
    private authService: AuthService,
    private toastService: ToastService,
    private cartService: CartService, 
    private router: Router
  ) {

    const cNavigation = this.router.getCurrentNavigation();
    if (cNavigation?.extras.state) {
      this.navigation = cNavigation.extras.state;
      this.order = this.navigation.order;
      console.log(this.order, 'ORDEN RECIBIDA DESDE EL CARRITO');
    } else {
      console.log('No se recibio orden');
    }



    this.userId = this.authService.getUserId();

    this.quotationForm = this.fb.group({
      company_id: ['', Validators.required],
      user_id: ['', Validators.required],
      validity_days: [15, [Validators.required, Validators.min(1), Validators.max(30)]],
      term: ['30', Validators.required],
      creation_mode: [CreationMode.Panel, Validators.required],
      created_by: [this.userId],
      expiration_date: [this.expiration_date],
      details: this.fb.array([], [Validators.required, Validators.min(1)]),
    });
  }

  ngOnInit(): void {

    this.users$ = this.userService.getUsers();
    this.companies$ = this.companiesService.findAll();

     // Si recibiste una orden, puedes usarla aquí para poblar el formulario
     if (this.order) {
      console.log(this.order.productos, 'PRODUCTOS RECIBIDOS DESDE EL CARRITO'); 
      this.populateFormWithOrderData();
    }
  }

    // Método opcional para poblar el formulario con los datos de la orden
    populateFormWithOrderData(): void {
      const detailsFormArray = this.details;
      this.order.productos.forEach((product: any) => {
        detailsFormArray.push(this.fb.group({
          product_id: [product.product.id, Validators.required],
          product_name: [product.product.nombre],
          quantity: [product.quantity, [Validators.required, Validators.min(1)]],
          unit_price: [product.product.precio, [Validators.required, Validators.min(0)]],
          discount: [0],
          taxes: [0],
        }));
      });
      this.calculateTotal(); // Recalcula el total inicial
    }

  // Métodos para abrir y cerrar el modal
  openProductModal(): void {
    // this.isProductModalVisible = true;
    this.router.navigate(['dashboard/advance-products']);
  }

  onModalClose(): void {
    this.isProductModalVisible = false;
  }
  
  // Método auxiliar para calcular el total (opcional pero recomendado)
  calculateTotal(): void {
    this.totalQuotation = this.details.value.reduce(
      (total: number, detail: any) => total + detail.quantity * detail.unit_price, 
      0
    );
  }
  
  // Asegúrate de llamar calculateTotal() también en removeDetail()
  removeDetail(index: number): void {
    this.details.removeAt(index);
    this.calculateTotal(); // <-- Añadir aquí
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
      if (!this.users$ || !this.companies$) {
        return;
      }

      this.quotationForm.get('expiration_date')?.setValue(
        new Date().toISOString().split('T')[0] + ' ' + this.quotationForm.get('validity_days')?.value + 'd'
      );

      this.users$.subscribe((user) => {
        this.user = user.find((user) => user.id === this.quotationForm.get('user_id')?.value);
      });

      this.companies$.subscribe((company) => {
        this.company = company.find((company) => company.id === this.quotationForm.get('company_id')?.value);
      });

      this.currentStep++;

      if(this.currentStep === 3){
        this.totalQuotation = this.details.value.reduce((total: number, detail: any) => total + detail.quantity * detail.unit_price, 0);
      }
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
        this.toastService.success(`Cotización creada exitosamente ${response.id}`);
        this.isLoading = false;
        this.onQuotationCreated.emit();
        this.cartService.clearCart();
        setTimeout(() => {
          this.router.navigate(['dashboard/cotizaciones'], {state: {order: response.id}});
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear la cotización:', error);
        this.toastService.error(`Error al crear la cotización ${error}`);
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['dashboard/advance-products']);
        }, 3000);
      },
    });
  }

}
