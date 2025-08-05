import { Component, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-user',
  standalone: true,
  // La sección 'imports' es la clave para solucionar los errores.
  // Aquí le decimos a este componente qué herramientas puede usar.
  imports: [
    CommonModule,      // Necesario para *ngIf, [ngClass], etc.
    FormsModule,       // Necesario para [(ngModel)], #nombre="ngModel", (ngSubmit), etc.
    FontAwesomeModule  // Necesario para el elemento <fa-icon>.
  ],
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent {

  // @ViewChild permite obtener una referencia directa al formulario del HTML.
  @ViewChild('createUserForm') createUserForm!: NgForm;

  // Objeto para almacenar los datos del formulario usando el bindeo de doble vía [(ngModel)].
  user = {
    nombre: '',
    email: '',
    password: ''
  };

  // Definimos los íconos como propiedades de la clase para usarlos en el template.
  faUser = faUser;
  faEnvelope = faEnvelope;
  faLock = faLock;
  faUserPlus = faUserPlus;

  /**
   * Esta función se ejecuta cuando el formulario es enviado.
   * @param form La instancia del formulario (NgForm) que se está enviando.
   */
  onSubmit(form: NgForm): void {
    // Si el formulario es inválido, detenemos la ejecución.
    if (form.invalid) {
      // Opcionalmente, podemos marcar todos los campos como "tocados" para mostrar todos los errores.
      Object.keys(form.controls).forEach(field => {
        const control = form.control.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }

    // Si llegamos aquí, el formulario es válido.
    console.log('Formulario enviado exitosamente. Es Válido:', form.valid);
    console.log('Valores:', form.value);

    // Creamos un objeto 'limpio' con los datos, listo para ser enviado a un API.
    const userPayload = { ...this.user };

    console.log('Body listo para el servicio:', userPayload);
    alert(`¡Usuario listo para crear!\n\nNombre: ${userPayload.nombre}\nEmail: ${userPayload.email}`);

    // Como buena práctica de UX, limpiamos el formulario después del envío.
    form.resetForm();
  }
}
