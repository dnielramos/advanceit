import { Component, EventEmitter, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faTimes, faRightToBracket } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-info-login',
  standalone: true,
  imports: [FontAwesomeModule], // Importa FontAwesomeModule para usar los iconos
  templateUrl: './info-login.component.html',
})
export class InfoLoginComponent {

  // Evento para notificar al componente padre que se debe cerrar el modal
  @Output() close = new EventEmitter<void>();

  // Evento para notificar al componente padre que el usuario quiere iniciar sesión
  @Output() loginAction = new EventEmitter<void>();

  // Definición de los iconos para usarlos en el template
  faLock = faLock;
  faTimes = faTimes;
  faRightToBracket = faRightToBracket;

  onCloseModal(): void {
    this.close.emit();
  }

  onLogin(): void {
    this.loginAction.emit();
    // Opcionalmente, podrías cerrar el modal aquí también si la lógica de login navega a otra página
    // this.onCloseModal();
  }
}
