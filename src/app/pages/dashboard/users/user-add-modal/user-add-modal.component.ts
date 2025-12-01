import { Component, signal, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUserPlus, faTimes, faUser, faEnvelope, faPhone, 
  faGlobe, faMapMarkerAlt, faCity, faBuilding, faShieldAlt,
  faChevronDown, faSpinner, faPlus, faSearch 
} from '@fortawesome/free-solid-svg-icons';
import { ToastService } from 'angular-toastify';
import { UsersService } from '../../../../services/users.service';
import { CompaniesService } from '../../../../services/companies.service';
import { User } from '../../../../models/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-add-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './user-add-modal.component.html',
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class UserAddModalComponent implements OnInit {
  // Íconos de FontAwesome
  faUserPlus = faUserPlus;
  faTimes = faTimes;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faGlobe = faGlobe;
  faMapMarkerAlt = faMapMarkerAlt;
  faCity = faCity;
  faBuilding = faBuilding;
  faShieldAlt = faShieldAlt;
  faChevronDown = faChevronDown;
  faSpinner = faSpinner;
  faPlus = faPlus;
  faSearch = faSearch;

  // Señales y eventos
  loading = signal(false);
  showFullForm = signal(false);
  @Output() closeModalEvent = new EventEmitter<boolean>();

  // Formulario reactivo
  userForm: FormGroup;
  
  // Observable de empresas
  companies$: Observable<any[]>;
  allCompanies: any[] = []; // Todas las empresas cargadas
  filteredCompanies: any[] = [];
  companySearchTerm: string = '';
  showDropdown: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private toastr: ToastService
  ) {
    this.companies$ = this.companiesService.findAll();
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      country: [''],
      city: [''],
      address: [''],
      company: ['', [Validators.required]],
      type: ['user', Validators.required],
      picture: ['https://placehold.co/150x150/663399/FFFFFF?text=U']
    });
  }
  
  ngOnInit(): void {
    console.log('🟢 [USER ADD MODAL] Inicializado');
    // Cargar empresas y configurar filtro
    this.companies$.subscribe(companies => {
      this.allCompanies = companies; // Guardar todas las empresas
      this.filteredCompanies = companies;
      console.log('🏢 [COMPANIES] Empresas cargadas:', companies.length);
    });
  }
  
  filterCompanies(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.companySearchTerm = input.value.toLowerCase();
    this.showDropdown = this.companySearchTerm.length > 0; // Mostrar dropdown solo si hay texto
    
    // Filtrar directamente del array en memoria
    this.filteredCompanies = this.allCompanies.filter(c => 
      c.razon_social?.toLowerCase().includes(this.companySearchTerm) ||
      c.nit?.toString().includes(this.companySearchTerm)
    );
    console.log('🔍 [SEARCH] Empresas filtradas:', this.filteredCompanies.length);
  }
  
  selectCompany(companyId: string, companyName: string): void {
    console.log('✅ [SELECT] Empresa seleccionada:', companyId, companyName);
    this.userForm.patchValue({ company: companyId });
    this.companySearchTerm = companyName; // Mostrar el nombre en el input
    this.showDropdown = false; // Ocultar dropdown al seleccionar
    console.log('✅ [SELECT] companySearchTerm actualizado a:', this.companySearchTerm);
    console.log('✅ [SELECT] Dropdown ocultado');
  }
  
  getSelectedCompanyName(): string {
    const companyId = this.userForm.get('company')?.value;
    if (!companyId) return '';
    
    // Buscar directamente en el array de todas las empresas
    const company = this.allCompanies.find(c => c.id === companyId);
    const companyName = company?.razon_social || '';
    console.log('📝 [GET NAME] ID:', companyId, '-> Nombre:', companyName);
    return companyName;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error('Por favor complete los campos requeridos');
      return;
    }

    this.loading.set(true);

    const form = this.userForm.value;
    const picture = form.picture || `https://placehold.co/150x150/663399/FFFFFF?text=${(form.name || 'U').charAt(0)}`;

    if (!this.showFullForm()) {
      const minimalPayload = {
        name: form.name,
        email: form.email,
        company: form.company,
        type: form.type,
        picture,
        password: 'advance@2025',
      };

      this.usersService.createUser(minimalPayload).subscribe({
        next: () => {
          this.toastr.success('Usuario creado exitosamente (contraseña automática: advance@2025)');
          this.closeModalEvent.emit(true);
        },
        error: (error: any) => {
          console.error('Error creating user:', error);
          this.toastr.error('Error al crear el usuario. Intente nuevamente.');
          this.loading.set(false);
        }
      });
      return;
    }

    const fullData = {
      name: form.name,
      email: form.email,
      telephone: form.telephone || '',
      country: form.country || '',
      city: form.city || '',
      address: form.address || '',
      company: form.company,
      type: form.type,
      picture,
    };

    this.usersService.createUserWithPayload(fullData).subscribe({
      next: () => {
        this.toastr.success('Usuario creado con todos los campos');
        this.closeModalEvent.emit(true);
      },
      error: (error: any) => {
        console.error('Error creating user with payload:', error);
        this.toastr.error('Error al crear el usuario con todos los campos. Intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  toggleFullForm(): void {
    this.showFullForm.update(v => !v);
  }

  closeModal(refresh: boolean = false): void {
    this.closeModalEvent.emit(refresh);
  }
}