import { Component, signal, computed } from '@angular/core';
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
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { UsersService } from '../../../services/users.service';
import { UserViewModalComponent } from './user-view-modal/user-view-modal.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';
import { User } from '../../../models/user';
import { UserAddModalComponent } from './user-add-modal/user-add-modal.component';
import { HeaderCrudComponent } from "../../../shared/header-dashboard/heeader-crud.component";
import { SkeletonCardComponent } from '../../../components/skeleton-card/skeleton-card.component';
import { SkeletonTableComponent } from '../../../components/skeleton-table/skeleton-table.component';

interface UserState {
  users: User[];
  selectedUser: User | null;
  showViewModal: boolean;
  showEditModal: boolean;
  showAddModal: boolean;
  viewMode: 'grid' | 'list';
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
    UserAddModalComponent,
    HeaderCrudComponent,
    SkeletonCardComponent,
    SkeletonTableComponent
],
  providers: [UsersService],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
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

  state = signal<UserState>({
    users: [],
    selectedUser: null,
    showViewModal: false,
    showEditModal: false,
    showAddModal: false,
    viewMode: 'grid',
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
      faUserPlus
    );
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.state.update((s) => ({ ...s, loading: true, error: null }));
    this.usersService.getUsers().subscribe({
      next: (data) => {
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

  setViewMode(mode: 'grid' | 'list'): void {
    this.state.update((s) => ({ ...s, viewMode: mode }));
  }

  // Agrega este método para abrir el modal de creación:
  openAddModal(): void {
    this.state.update((s) => ({
      ...s,
      showAddModal: true,
    }));
  }

  viewUser(user: User): void {
    this.state.update((s) => ({
      ...s,
      selectedUser: user,
      showViewModal: true,
    }));
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
    }));
    if (refresh) this.loadUsers();
  }

  handleViewChange(mode: 'grid' | 'list'): void {
    this.setViewMode(mode);
  }
}
