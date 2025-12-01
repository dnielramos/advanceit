import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { User } from '../../../../models/user';
import { UpdateUserDto, UsersService } from '../../../../services/users.service';
import { CompaniesService } from '../../../../services/companies.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faUser, faEnvelope, faMapMarkerAlt, faCity, faGlobe, faBuilding, faImage, faPhone, faUserTag, faSearch } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './user-edit-modal.component.html',
})
export class UserEditModalComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() closeModal = new EventEmitter<void>();

  editForm!: FormGroup;
  hasChanges = false;

  // FontAwesome icons
  faTimes = faTimes;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;
  faCity = faCity;
  faGlobe = faGlobe;
  faBuilding = faBuilding;
  faImage = faImage;
  faPhone = faPhone;
  faUserTag = faUserTag;
  faSearch = faSearch;
  
  // Empresas
  companies$: Observable<any[]>;
  allCompanies: any[] = []; // Todas las empresas cargadas
  filteredCompanies: any[] = [];
  companySearchTerm: string = '';
  showDropdown: boolean = false;
  isFirstFocus: boolean = true; // Para saber si es la primera vez que hace focus

  constructor(
    private fb: FormBuilder, 
    private usersService: UsersService,
    private companiesService: CompaniesService
  ) {
    this.companies$ = this.companiesService.findAll();
  }

  ngOnInit(): void {
    console.log('🟢 [USER EDIT MODAL] Inicializado con usuario:', this.user);
    
    this.editForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      email: [{ value: this.user?.email || '', disabled: true }, Validators.required],
      address: [this.user?.address || ''],
      city: [this.user?.city || ''],
      country: [this.user?.country || ''],
      company: [this.user?.company || ''],
      picture: [this.user?.picture || ''],
      telephone: [this.user?.telephone || ''],
      type: [this.user?.type || 'user', Validators.required],
    });

    // Cargar empresas e inicializar nombre de empresa actual
    this.companies$.subscribe(companies => {
      this.allCompanies = companies; // Guardar todas las empresas
      this.filteredCompanies = companies;
      console.log('🏢 [COMPANIES] Empresas cargadas:', companies.length);
      
      // Diagnóstico completo del usuario y su empresa
      console.log('👤 [USER DEBUG] Usuario completo:', this.user);
      console.log('👤 [USER DEBUG] user.company (valor):', this.user?.company, 'Tipo:', typeof this.user?.company);
      
      // Si el usuario ya tiene una empresa, mostrar su nombre
      if (this.user?.company) {
        // Asegurar que comparamos strings
        const userCompanyId = String(this.user.company);
        
        const currentCompany = companies.find(c => String(c.id) === userCompanyId);
        
        if (currentCompany) {
          this.companySearchTerm = currentCompany.razon_social;
          console.log('🏢 [INIT] Empresa ENCONTRADA:', currentCompany.razon_social);
        } else {
          console.warn('⚠️ [INIT] Empresa NO encontrada en la lista. ID buscado:', userCompanyId);
          console.log('📋 [INIT] IDs disponibles (primeros 5):', companies.slice(0, 5).map(c => c.id));
        }
      } else {
        console.log('⚠️ [INIT] El usuario no tiene propiedad company definida');
      }
    });
    
    // Detectar cambios
    this.editForm.valueChanges.subscribe(() => {
      this.hasChanges = this.editForm.dirty;
    });
  }
  
  onInputFocus(): void {
    // Solo limpiar si NO es la primera vez (ya vio la empresa actual)
    if (!this.isFirstFocus) {
      this.companySearchTerm = '';
      this.showDropdown = false;
      console.log('🎯 [FOCUS] Campo limpiado para nueva búsqueda');
    } else {
      this.isFirstFocus = false;
      console.log('🎯 [FOCUS] Primera vez - mostrando empresa actual');
    }
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
    this.editForm.patchValue({ company: companyId });
    this.companySearchTerm = companyName; // Mostrar el nombre en el input
    this.showDropdown = false; // Ocultar dropdown al seleccionar
    this.isFirstFocus = true; // Resetear para mostrar la empresa la próxima vez que haga focus
    this.editForm.markAsDirty(); // Marcar como modificado para habilitar guardar
    this.hasChanges = true;
    console.log('✅ [SELECT] Formulario marcado como dirty');
    console.log('✅ [SELECT] Dropdown ocultado');
  }
  
  getSelectedCompanyName(): string {
    const companyId = this.editForm.get('company')?.value;
    if (!companyId) return '';
    
    // Buscar directamente en el array de todas las empresas
    const company = this.allCompanies.find(c => c.id === companyId);
    const companyName = company?.razon_social || '';
    console.log('📝 [GET NAME] ID:', companyId, '-> Nombre:', companyName);
    return companyName;
  }

  saveChanges(): void {
    if (this.editForm.valid && this.user && this.hasChanges) {
      const updates: UpdateUserDto = this.editForm.getRawValue();
      this.usersService.updateUser(this.user.id, updates).subscribe({
        next: () => {
          this.closeModal.emit();
        },
        error: (error) => {
          console.error('Error updating user', error);
        },
      });
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
