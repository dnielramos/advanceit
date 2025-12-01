import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faEye,
  faPen,
  faTh,
  faList,
  faSearch,
  faUserSlash,
  faSpinner,
  faTimes,
  faUsers,
  faUserPlus,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { UsersService } from '../../../services/users.service';
import { UserViewModalComponent } from './user-view-modal/user-view-modal.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';
import { User, UserPopulated } from '../../../models/user';
import { UserAddModalComponent } from './user-add-modal/user-add-modal.component';
import { HeaderCrudComponent } from "../../../shared/header-dashboard/heeader-crud.component";
import { SkeletonCardComponent } from '../../../components/skeleton-card/skeleton-card.component';
import { SkeletonTableComponent } from '../../../components/skeleton-table/skeleton-table.component';
import { ViewModeService } from '../../../services/view-mode.service';

interface UserState {
  users: User[];
  selectedUser: User | null;              // Para edición
  selectedUserPopulated: UserPopulated | null; // Para vista/perfil
  showViewModal: boolean;
  showEditModal: boolean;
  showAddModal: boolean;
  searchTerm: string;
  roleFilter: string;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    UserViewModalComponent,
    UserEditModalComponent,
    UserAddModalComponent,
    HeaderCrudComponent,
    SkeletonCardComponent,
    SkeletonTableComponent
],
  providers: [UsersService],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private viewModeService = inject(ViewModeService);
  viewMode = this.viewModeService.viewMode;
  
  faEye = faEye;
  faPen = faPen;
  faTh = faTh;
  faList = faList;
  faSearch = faSearch;
  faUserSlash = faUserSlash;
  faSpinner = faSpinner;
  faUsers = faUsers;
  faUserPlus = faUserPlus;
  faTimes = faTimes;
  faPlus = faPlus;

  state = signal<UserState>({
    users: [],
    selectedUser: null,
    selectedUserPopulated: null,
    showViewModal: false,
    showEditModal: false,
    showAddModal: false,
    searchTerm: '',
    roleFilter: '',
    loading: true,
    error: null,
  });

  // Roles disponibles para filtrar
  availableRoles: string[] = ['user', 'admin', 'cashier', 'warehouse'];

  filteredUsers = computed(() => {
    const users = this.state().users;
    const term = this.state().searchTerm.toLowerCase();
    const roleFilter = this.state().roleFilter;
    
    return users.filter((user) => {
      const matchesText = !term || 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      const matchesRole = !roleFilter || user.type === roleFilter;
      return matchesText && matchesRole;
    });
  });

  constructor(private usersService: UsersService, library: FaIconLibrary) {
    library.addIcons(
      faEye,
      faPen,
      faTh,
      faList,
      faSearch,
      faUserSlash,
      faSpinner,
      faTimes,
      faUserPlus,
      faPlus
    );
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));
    this.usersService.getUsers().subscribe({
      next: (data: User[]) => {
        this.state.update((s) => ({ ...s, users: data, loading: false }));
      },
      error: () =>
        this.state.update((s) => ({
          ...s,
          loading: false,
          error: 'No se pudo conectar al servidor.',
        })),
    });
  }

  updateSearchTerm(term: string): void {
    this.state.update((s) => ({ ...s, searchTerm: term }));
  }

  handleFilterChange(filters: { texto: string; estado: string }): void {
    this.state.update((s) => ({ 
      ...s, 
      searchTerm: filters.texto,
      roleFilter: filters.estado 
    }));
  }

  handleClearFilters(): void {
    this.state.update((s) => ({ 
      ...s, 
      searchTerm: '',
      roleFilter: '' 
    }));
  }

  // Agrega este método para abrir el modal de creación:
  openAddModal(): void {
    this.state.update((s) => ({
      ...s,
      showAddModal: true,
    }));
  }

  viewUser(user: User): void {
    // Cargar el usuario "populado" (con company.name) antes de abrir el modal
    this.state.update((s) => ({ ...s, loading: true }));

    this.usersService.getUserByIdPopulated(user.id).subscribe({
      next: (populated: UserPopulated) => {
        this.state.update((s) => ({
          ...s,
          selectedUserPopulated: populated,
          showViewModal: true,
          loading: false,
        }));
      },
      error: () => {
        this.state.update((s) => ({
          ...s,
          loading: false,
          error: 'No se pudo cargar el perfil del usuario.',
        }));
      },
    });
  }

  editUser(user: User): void {
    this.state.update((s) => ({
      ...s,
      selectedUser: user,
      showEditModal: true,
    }));
  }

  closeModal(refresh: boolean = false): void {
    this.state.update((s) => ({
      ...s,
      showViewModal: false,
      showEditModal: false,
      showAddModal: false,
      selectedUser: null,
      selectedUserPopulated: null,
    }));
    if (refresh) this.loadUsers();
  }

  handleViewChange(mode: 'grid' | 'list'): void {
    this.viewModeService.setViewMode(mode);
  }

  softDelete(user: User): void {
    const confirmed = window.confirm(`¿Seguro que deseas desactivar al usuario "${user.name}"?`);
    if (!confirmed) return;

    this.state.update((s) => ({ ...s, loading: true }));
    this.usersService.softDeleteUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: () => {
        this.state.update((s) => ({
          ...s,
          loading: false,
          error: 'No se pudo desactivar el usuario.',
        }));
      },
    });
  }

  reactivate(user: User): void {
    const confirmed = window.confirm(`¿Seguro que deseas reactivar al usuario "${user.name}"?`);
    if (!confirmed) return;

    this.state.update((s) => ({ ...s, loading: true }));
    this.usersService.reactivateUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: () => {
        this.state.update((s) => ({
          ...s,
          loading: false,
          error: 'No se pudo reactivar el usuario.',
        }));
      },
    });
  }
}
