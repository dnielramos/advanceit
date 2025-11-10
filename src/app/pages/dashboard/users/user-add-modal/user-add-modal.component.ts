import { Component, signal, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUserPlus, faTimes, faUser, faEnvelope, faPhone, 
  faGlobe, faMapMarkerAlt, faCity, faBuilding, faShieldAlt,
  faChevronDown, faSpinner, faPlus 
} from '@fortawesome/free-solid-svg-icons';
import { ToastService } from 'angular-toastify';
import { UsersService } from '../../../../services/users.service';
import { User } from '../../../../models/user';

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
export class UserAddModalComponent {
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

  // Señales y eventos
  loading = signal(false);
  @Output() closeModalEvent = new EventEmitter<boolean>();

  // Formulario reactivo
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private toastr: ToastService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      country: [''],
      city: [''],
      address: [''],
      company: [''],
      type: ['user', Validators.required],
      picture: ['https://placehold.co/150x150/663399/FFFFFF?text=U']
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error('Por favor complete los campos requeridos');
      return;
    }

    this.loading.set(true);
    
    const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      ...this.userForm.value,
      picture: this.userForm.value.picture || 'https://placehold.co/150x150/663399/FFFFFF?text=' + this.userForm.value.name.charAt(0)
    };

    this.usersService.createUser(newUser).subscribe({
      next: () => {
        this.toastr.success('Usuario creado exitosamente');
        this.closeModalEvent.emit(true);
      },
      error: (error: any) => {
        console.error('Error creating user:', error);
        this.toastr.error('Error al crear el usuario. Intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  closeModal(refresh: boolean = false): void {
    this.closeModalEvent.emit(refresh);
  }
}