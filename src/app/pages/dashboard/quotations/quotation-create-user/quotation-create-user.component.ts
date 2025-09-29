import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subscription, take } from 'rxjs';

// FontAwesome y Toastify
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus,
  faTrashAlt,
  faSave,
  faSpinner,
  faArrowLeft,
  faArrowRight,
  faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons';
import { AngularToastifyModule, ToastService } from 'angular-toastify';

// Servicios y Modelos
import { QuotationService } from '../../../../services/quotation.service';
import {
  CompaniesService,
  Company,
} from '../../../../services/companies.service';
import { UsersService } from '../../../../services/users.service';
import { AuthService, Role } from '../../../../services/auth.service';
import { CartService } from '../../../../services/cart.service';
import { CreateFullQuotationDto } from '../../../../models/quotation.types';
import { CreationMode } from '../../../../models/creation-mode';
import { User } from '../../../../models/user';

// Registrar iconos
library.add(
  faPlus,
  faTrashAlt,
  faSave,
  faSpinner,
  faArrowLeft,
  faArrowRight,
  faFileInvoiceDollar
);

@Component({
  selector: 'app-quotation-create-user',
  templateUrl: './quotation-create-user.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    AngularToastifyModule,
  ],
})
export class QuotationCreateUserComponent implements OnInit, OnDestroy {
  // Observables para datos
  users$!: Observable<User[]>;
  companies$!: Observable<Company[]>;

  // Estado del componente
  quotationForm: FormGroup;
  userRole: Role | null = null;
  isLoading = false;
  currentStep = 1;
  currentDate = new Date();
  private subscriptions = new Subscription();

  // Datos para el resumen
  selectedUser: User | undefined;
  selectedCompany: Company | undefined;
  readonly Role = Role;

  // Propiedades para cálculos detallados
  subtotal: number = 0;
  totalDescuentos: number = 0;
  valorBaseDescuentos: number = 0;
  valorLogistica: number = 0;
  baseParaIVA: number = 0;
  valorIVA: number = 0;
  granTotal: number = 0;

  // Propiedades para validación de crédito
  creditoDisponible: number = 0;
  creditoCubreOrden: boolean = true;
  esOrdenDeContado: boolean = true;

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private companiesService: CompaniesService,
    private usersService: UsersService,
    private authService: AuthService,
    private toastService: ToastService,
    private cartService: CartService,
    private router: Router
  ) {
    const currentUserId = this.authService.getUserId();

    this.quotationForm = this.fb.group({
      company_id: [null, Validators.required],
      user_id: [null, Validators.required],
      validity_days: [15, Validators.required],
      term: ['30', Validators.required],
      creation_mode: [CreationMode.Panel, Validators.required],
      created_by: [currentUserId],
      details: this.fb.array(
        [],
        [Validators.required, Validators.minLength(1)]
      ),
    });

    const navigation = this.router.getCurrentNavigation();
    const order = navigation?.extras.state?.['order'];
    if (order) {
      this.populateFormWithOrderData(order);
    }
  }

  ngOnInit(): void {
    this.userRole = this.authService.getCurrentUserRole();
    this.initializeUserDataAndSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get details(): FormArray {
    return this.quotationForm.get('details') as FormArray;
  }

  private initializeUserDataAndSubscriptions(): void {
    // Suscripción a cambios en los productos (siempre activa)
    const detailsSub = this.details.valueChanges.subscribe(() =>
      this.recalculateTotals()
    );
    this.subscriptions.add(detailsSub);

    if (this.userRole === Role.Admin) {
      this.users$ = this.usersService.getUsers();
      this.companies$ = this.companiesService.findAll();

      // Suscripción a cambios en la empresa (solo para admin)
      const companySub = this.quotationForm
        .get('company_id')!
        .valueChanges.subscribe((companyId) => {
          if (companyId) {
            this.companies$.pipe(take(1)).subscribe((companies) => {
              this.selectedCompany = companies.find((c) => c.id === companyId);
              this.recalculateTotals(); // Recalcular al cambiar de empresa
            });
          }
        });
      this.subscriptions.add(companySub);
    } else if (this.userRole === Role.User) {
      const userId = this.authService.getUserId();
      if (!userId) return;

      this.usersService
        .getUserById(userId)
        .pipe(take(1))
        .subscribe((user) => {
          this.selectedUser = user;
          const companyId = user.company?.id || 11;

          this.companiesService
            .findById(companyId)
            .pipe(take(1))
            .subscribe((company) => {
              this.selectedCompany = company; // Guardamos la empresa

              this.quotationForm.patchValue({
                user_id: this.selectedUser?.id,
                company_id: this.selectedCompany?.id,
                term:
                  parseInt(this.selectedCompany?.condiciones_pago) > 0
                    ? `${this.selectedCompany.condiciones_pago}`
                    : 'Contado',
              });

              this.quotationForm.get('user_id')?.disable();
              this.quotationForm.get('company_id')?.disable();
              this.quotationForm.get('term')?.disable();
              this.quotationForm.get('validity_days')?.disable();

              // **FIX:** Llamada explícita al recálculo una vez que todos los datos están listos
              this.recalculateTotals();
            });
        });
    }
  }

  private populateFormWithOrderData(order: any): void {
    order.productos.forEach((item: any) => {
      this.details.push(
        this.fb.group({
          product_id: [item.product.id, Validators.required],
          product_name: [item.product.nombre],
          product_description: [item.product.descripcion],
          product_image: [item.product.imagen],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          unit_price: [
            item.product.precio,
            [Validators.required, Validators.min(0)],
          ],
        })
      );
    });
  }

  private normalizeCompany(raw: Company): Company {
  return {
    ...raw,
    descuento_base: String(raw.descuento_base ?? '0'),
    descuento_especial: String(raw.descuento_especial ?? '0'),
    valor_logistica: String(raw.valor_logistica ?? '0'),
    saldo_credito: String(raw.saldo_credito ?? '0'),
    saldo_gastado: String(raw.saldo_gastado ?? '0'),
  };
}

  private recalculateTotals(): void {
    if (!this.selectedCompany) return;

    // 1. Parsear valores de la empresa (asegurando número)
    const descuentoBase = parseFloat(
      this.selectedCompany.descuento_base || '0'
    );
    const descuentoEspecial = parseFloat(
      this.selectedCompany.descuento_especial || '0'
    );
    this.valorLogistica = parseFloat(
      this.selectedCompany.valor_logistica || '0'
    );
    const saldoCredito = parseFloat(this.selectedCompany.saldo_credito || '0');
    const saldoGastado = parseFloat(this.selectedCompany.saldo_gastado || '0');

    // 2. Calcular subtotal de productos
    this.subtotal = this.details.value.reduce(
      (acc: number, detail: any) => acc + detail.quantity * detail.unit_price,
      0
    );

    // 3. Aplicar descuentos
    const descBaseValor = (this.subtotal * descuentoBase) / 100;
    const descEspecialValor = (this.subtotal * descuentoEspecial) / 100;
    this.valorBaseDescuentos = descBaseValor + descEspecialValor;
    this.totalDescuentos = descuentoBase + descuentoEspecial;

    // 4. Calcular base para el IVA
    this.baseParaIVA =
      this.subtotal - this.valorBaseDescuentos + this.valorLogistica;
    this.valorIVA = this.baseParaIVA * 0.19;

    // 5. Calcular Gran Total
    this.granTotal = this.baseParaIVA + this.valorIVA;

    // 6. Validar Crédito
    this.esOrdenDeContado =
      parseInt(this.selectedCompany.condiciones_pago.toString()) === 0 ||
      saldoCredito === 0;
    if (this.esOrdenDeContado) {
      this.creditoDisponible = 0;
      this.creditoCubreOrden = true;
    } else {
      this.creditoDisponible = saldoCredito - saldoGastado;
      this.creditoCubreOrden = this.creditoDisponible >= this.granTotal;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        if (this.userRole === Role.User) {
          return !!this.selectedUser && !!this.selectedCompany;
        } else {
          return (
            this.quotationForm.get('company_id')!.valid &&
            this.quotationForm.get('user_id')!.valid
          );
        }
      case 2:
        return this.details.valid && this.details.length > 0;
      default:
        return true;
    }
  }

  nextStep(): void {
    if (!this.isStepValid(this.currentStep)) {
      this.toastService.error(
        'Por favor, completa todos los campos requeridos.'
      );
      return;
    }

    if (this.currentStep === 2 && this.userRole === Role.Admin) {
      const userId = this.quotationForm.get('user_id')?.value;
      this.users$.pipe(take(1)).subscribe((users) => {
        this.selectedUser = users.find((u) => u.id === userId);
      });
    }
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  removeDetail(index: number): void {
    this.details.removeAt(index);
  }

  openProductModal(): void {
    this.router.navigate(['dashboard/advance-products']);
  }

  onSubmit(): void {
    if (this.quotationForm.invalid) {
      this.toastService.error(
        'El formulario tiene errores. Por favor, verifica los datos.'
      );
      return;
    }

    if (!this.creditoCubreOrden) {
      this.toastService.error(
        'La orden no puede ser creada. El crédito de la empresa es insuficiente.'
      );
      return;
    }

    this.isLoading = true;
    const formValue = this.quotationForm.getRawValue();

    // Puedes agregar más campos al payload si tu backend los necesita (total, iva, etc.)
    const payload: CreateFullQuotationDto = {
      quotation: {
        company_id: formValue.company_id,
        user_id: formValue.user_id,
        validity_days: formValue.validity_days,
        term: formValue.term,
        creation_mode: formValue.creation_mode,
        created_by: formValue.created_by,
        total: this.granTotal,
      },
      details: formValue.details.map((d: any) => ({
        product_id: d.product_id,
        quantity: d.quantity,
        unit_price: d.unit_price,
        subtotal: d.quantity * d.unit_price,
        discount: 0,
        taxes: 0,
      })),
    };

    this.quotationService.create(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.success(
          `Cotización #${response.id} creada con éxito.`
        );
        this.cartService.clearCart();
        this.router.navigate(['/dashboard/cotizaciones']);
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error(
          'Error al crear la cotización. Inténtalo de nuevo.'
        );
        console.error('Error de creación:', error);
      },
    });
  }
}
