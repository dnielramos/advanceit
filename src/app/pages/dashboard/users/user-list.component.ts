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

interface UserState {
  users: User[];
  selectedUser: User | null;
  showViewModal: boolean;
  showEditModal: boolean;
  showAddModal: boolean;
  viewMode: 'grid' | 'list';
  searchTerm: string;
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
    UserAddModalComponent
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

  state = signal<UserState>({
    users: [],
    selectedUser: null,
    showViewModal: false,
    showEditModal: false,
    showAddModal: false,
    viewMode: 'grid',
    searchTerm: '',
    loading: true,
    error: null,
  });

  filteredUsers = computed(() => {
    const users = this.state().users;
    const term = this.state().searchTerm.toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
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
      next: (data) =>
        this.state.update((s) => ({ ...s, users: data, loading: false })),
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
}
