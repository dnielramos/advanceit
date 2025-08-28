import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../../models/user';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes, faUser, faEnvelope, faMapMarkerAlt, faCity,
  faGlobe, faBuilding, faPhone, faUserTag, faImage
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-view-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './user-view-modal.component.html',
})
export class UserViewModalComponent {
  @Input() user: User | null = null;
  @Output() closeModal = new EventEmitter<void>();

  // FontAwesome icons
  faTimes = faTimes;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;
  faCity = faCity;
  faGlobe = faGlobe;
  faBuilding = faBuilding;
  faPhone = faPhone;
  faUserTag = faUserTag;
  faImage = faImage;

  close(): void {
    this.closeModal.emit();
  }
}
