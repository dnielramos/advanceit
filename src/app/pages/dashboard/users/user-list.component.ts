// src/app/components/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { User } from '../../../models/user';
import { UsersService } from '../../../services/users.service';
import { UserViewModalComponent } from './user-view-modal/user-view-modal.component';
import { UserEditModalComponent } from './user-edit-modal/user-edit-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  imports: [UserViewModalComponent, UserEditModalComponent, CommonModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  showViewModal = false;
  showEditModal = false;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Error fetching users', error);
      }
    );
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
    this.loadUsers(); // Refresh the list after closing
  }
}
