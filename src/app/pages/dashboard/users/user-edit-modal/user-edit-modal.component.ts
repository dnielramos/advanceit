// src/app/components/user-edit-modal/user-edit-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../../models/user';
import {
  UpdateUserDto,
  UsersService,
} from '../../../../services/users.service';

@Component({
  selector: 'app-user-edit-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './user-edit-modal.component.html',
})
export class UserEditModalComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() closeModal = new EventEmitter<void>();
  editForm: FormGroup;

  constructor(private fb: FormBuilder, private usersService: UsersService) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, Validators.required],
      address: [''],
      country: [''],
      city: [''],
      company: [''],
      picture: [''],
      type: [''],
      telephone: [''],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.editForm.patchValue(this.user);
    }
  }

  saveChanges(): void {
    if (this.editForm.valid && this.user) {
      const updates: UpdateUserDto = this.editForm.value;
      this.usersService.updateUser(this.user.id, updates).subscribe({
        next: () => {
          console.log('User updated successfully!');
          this.closeModal.emit();
        },
        error: (error: any) => {
          console.error('Error updating user', error);
        },
      });
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
