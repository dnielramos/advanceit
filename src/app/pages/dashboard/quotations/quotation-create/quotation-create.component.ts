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
  PreviewQuotationDto,
  PreviewQuotationResponse,
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
import { CompaniesService, Company } from '../../../../services/companies.service';
import { UsersService } from '../../../../services/users.service';
import { AuthService, Role } from '../../../../services/auth.service';
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
  filteredUsers$: Observable<any[]> | undefined; // Usuarios filtrados por empresa

  order: any;
  navigation: any;
  companyActive: any;

  isLogging = false;
  userRole: string | null = null;
  isAdmin = false;

  quotationForm: FormGroup;
  isLoading = false;
  isLoadingPreview = false;
  currentStep = 1;
  userId: string | null = null;
  isProductModalVisible = false; // Estado del modal

  hoy: string = new Date().toISOString().split('T')[0];
  expiration_date: string = new Date().toISOString().split('T')[0];

  user: any = '';
  company: Company | null = null;
  totalQuotation: number = 0;
  previewData: PreviewQuotationResponse | null = null;

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
    console.log('🟢 [INIT] Componente inicializado');
    
    this.users$ = this.userService.getUsers();
    this.filteredUsers$ = this.users$;
    this.companies$ = this.companiesService.findAll();
    
    this.authService.currentUserRole$.subscribe((role) => {
      this.userRole = role;
      this.isAdmin = role === Role.Admin;
      console.log('👤 [ROLE] Rol detectado:', role, '| isAdmin:', this.isAdmin);
    });

    // Si recibiste una orden, puedes usarla aquí para poblar el formulario
    if (this.order) {
      console.log('📦 [ORDER] Productos recibidos desde el carrito:', this.order.productos);
      this.populateFormWithOrderData();
    }

    // Escuchar cambios en company_id
    this.quotationForm.get('company_id')?.valueChanges.subscribe((companyId) => {
      console.log('🏢 [COMPANY CHANGE] Empresa seleccionada:', companyId);
      this.onCompanyChange(companyId);
    });
    
    console.log('✅ [INIT] Listeners configurados correctamente');
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

  // Método para manejar cambio de empresa
  onCompanyChange(companyId: string): void {
    console.log('🔄 [onCompanyChange] Iniciando cambio de empresa. CompanyId:', companyId);
    
    if (!companyId) {
      console.log('⚠️ [onCompanyChange] CompanyId vacío, abortando');
      return;
    }

    console.log('📡 [API] Consultando empresa:', companyId);
    // Obtener datos de la empresa seleccionada
    this.companiesService.findById(companyId).subscribe({
      next: (company) => {
        console.log('✅ [API RESPONSE] Empresa obtenida:', company);
        this.company = company;
        
        // SIEMPRE buscar y filtrar usuarios de esta empresa
        if (this.users$) {
          console.log('👥 [USERS] Filtrando usuarios para empresa:', companyId);
          this.users$.subscribe((users) => {
            console.log('👥 [USERS] Total usuarios disponibles:', users.length);
            const companyUsers = users.filter((u: any) => u.company === companyId);
            console.log('👥 [USERS] Usuarios filtrados para esta empresa:', companyUsers.length, companyUsers);
            
            // Filtrar usuarios para mostrar solo los de esta empresa
            this.filteredUsers$ = new Observable((observer) => {
              observer.next(companyUsers);
              observer.complete();
            });
            console.log('✅ [USERS] filteredUsers$ actualizado');
            
            // Seleccionar automáticamente el primer usuario
            if (companyUsers.length > 0) {
              console.log('🎯 [AUTO-SELECT] Seleccionando primer usuario:', companyUsers[0]);
              this.quotationForm.patchValue({
                user_id: companyUsers[0].id
              });
              this.user = companyUsers[0];
              console.log('✅ [AUTO-SELECT] Usuario establecido en formulario. user_id:', companyUsers[0].id);
            } else {
              console.warn('⚠️ [AUTO-SELECT] No hay usuarios para esta empresa');
            }
          });
        } else {
          console.error('❌ [USERS] users$ no está disponible');
        }

        // Establecer términos automáticamente desde la empresa
        if (company.condiciones_pago) {
          console.log('📋 [TERMS] Estableciendo términos:', company.condiciones_pago);
          this.quotationForm.patchValue({
            term: company.condiciones_pago
          });
          console.log('✅ [TERMS] Términos establecidos en formulario');
        } else {
          console.warn('⚠️ [TERMS] Empresa no tiene condiciones_pago');
        }
        
        console.log('🏁 [onCompanyChange] Proceso completado');
      },
      error: (error) => {
        console.error('❌ [API ERROR] Error al obtener empresa:', error);
        this.toastService.error('Error al cargar datos de la empresa');
      }
    });
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

      // Si llegamos al paso 3 (resumen), obtener preview del backend
      if (this.currentStep === 3) {
        this.loadPreview();
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

  // Método para cargar el preview con cálculos del backend
  loadPreview(): void {
    console.log('🔮 [PREVIEW] Iniciando carga de preview...');
    this.isLoadingPreview = true;
    const formValue = this.quotationForm.getRawValue();
    console.log('📝 [PREVIEW] Valores del formulario:', formValue);

    const previewPayload: PreviewQuotationDto = {
      company_id: formValue.company_id,
      user_id: formValue.user_id,
      products: formValue.details.map((detail: any) => ({
        product_id: detail.product_id,
        quantity: detail.quantity,
        unit_price: detail.unit_price,
      })),
      validity_days: formValue.validity_days,
      term: formValue.term,
      creation_mode: formValue.creation_mode,
      created_by: formValue.created_by,
    };

    console.log('📤 [PREVIEW API REQUEST] Payload enviado:', JSON.stringify(previewPayload, null, 2));

    this.quotationService.preview(previewPayload).subscribe({
      next: (response) => {
        console.log('✅ [PREVIEW API RESPONSE] Respuesta recibida:', response);
        console.log('💰 [PREVIEW] Cálculos:', response.calculations);
        console.log('🏢 [PREVIEW] Empresa:', response.company);
        console.log('💳 [PREVIEW] Crédito:', response.company.credit);
        this.previewData = response;
        this.isLoadingPreview = false;
      },
      error: (error) => {
        console.error('❌ [PREVIEW API ERROR] Error al cargar preview:', error);
        console.error('❌ [PREVIEW API ERROR] Detalles:', error.error);
        console.error('❌ [PREVIEW API ERROR] Status:', error.status);
        this.isLoadingPreview = false;
        this.toastService.error('Error al calcular la cotización');
      },
    });
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
    console.log('🚀 [SUBMIT] Iniciando envío de cotización...');
    console.log('🔍 [SUBMIT] currentStep:', this.currentStep);
    console.log('🔍 [SUBMIT] formulario válido:', this.quotationForm.valid);
    console.log('🔍 [SUBMIT] previewData existe:', !!this.previewData);
    
    if (this.currentStep !== 3 || this.quotationForm.invalid || !this.previewData) {
      console.error('❌ [SUBMIT] Validación fallida - Formulario no válido para el envío o sin preview.');
      this.markFormGroupTouched(this.quotationForm);
      return;
    }

    this.isLoading = true;
    const formValue = this.quotationForm.getRawValue();
    console.log('📝 [SUBMIT] Valores del formulario:', formValue);

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

    // Usar los cálculos del preview para crear la cotización
    const payload: CreateFullQuotationDto = {
      quotation: {
        company_id: formValue.company_id,
        user_id: formValue.user_id,
        validity_days: formValue.validity_days,
        term: formValue.term,
        creation_mode: formValue.creation_mode,
        created_by: formValue.created_by,
        total: this.previewData.calculations.total,
        subtotal_productos: this.previewData.calculations.subtotal_productos,
        porcentaje_descuento: this.previewData.calculations.porcentaje_descuento,
        valor_descuento: this.previewData.calculations.valor_descuento,
        valor_logistica: this.previewData.calculations.valor_logistica,
        base_gravable: this.previewData.calculations.base_gravable,
        porcentaje_iva: this.previewData.calculations.porcentaje_iva,
        valor_iva: this.previewData.calculations.valor_iva,
      },
      details: detailsWithSubtotal,
    };

    console.log('📤 [SUBMIT API REQUEST] Payload completo:', JSON.stringify(payload, null, 2));

    this.quotationService.create(payload).subscribe({
      next: (response) => {
        console.log('✅ [SUBMIT API RESPONSE] Cotización creada exitosamente:', response);
        this.toastService.success(`Cotización creada exitosamente ${response.id}`);
        this.isLoading = false;
        this.onQuotationCreated.emit();
        this.cartService.clearCart();
        setTimeout(() => {
          this.router.navigate(['dashboard/cotizaciones'], {state: {order: response.id}});
        }, 3000);
      },
      error: (error) => {
        console.error('❌ [SUBMIT API ERROR] Error al crear la cotización:', error);
        console.error('❌ [SUBMIT API ERROR] Detalles:', error.error);
        console.error('❌ [SUBMIT API ERROR] Status:', error.status);
        this.isLoading = false;
        this.toastService.error(`Error al crear la cotización ${error}`);
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['dashboard/advance-products']);
        }, 3000);
      },
    });
  }

}
