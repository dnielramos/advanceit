import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../../models/user';
import { UpdateUserDto, UsersService } from '../../../../services/users.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faUser, faEnvelope, faMapMarkerAlt, faCity, faGlobe, faBuilding, faImage, faPhone, faUserTag } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
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

  constructor(private fb: FormBuilder, private usersService: UsersService) {}

  ngOnInit(): void {
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

    // Detectar cambios
    this.editForm.valueChanges.subscribe(() => {
      this.hasChanges = this.editForm.dirty;
    });
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
