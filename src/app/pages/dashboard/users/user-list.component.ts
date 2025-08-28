import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { User } from '../../../models/user';
import { UsersService } from '../../../services/users.service';
import { UserViewModalComponent } from './user-view-modal/user-view-modal.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faPen } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserViewModalComponent, UserEditModalComponent, FontAwesomeModule],
templateUrl: './user-list.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  showViewModal = false;
  showEditModal = false;
  faEye = faEye;
  faPen = faPen;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Error fetching users', err),
    });
  }

  viewUser(user: User): void {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showViewModal = false;
    this.showEditModal = false;
    this.selectedUser = null;
    this.loadUsers();
  }
}
