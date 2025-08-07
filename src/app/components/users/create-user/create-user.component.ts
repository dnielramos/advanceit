import { Component, ViewChild, inject } from '@angular/core'; // <-- inject es una forma moderna de inyectar
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faEnvelope,
  faLock,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http'; // <-- Importa HttpClient
import { Router } from '@angular/router'; // <-- Importa Router para navegar

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent {
  // Inyección de dependencias moderna y recomendada
  private http = inject(HttpClient);
  private router = inject(Router);

  @ViewChild('createUserForm') createUserForm!: NgForm;

  user = {
    nombre: '',
    email: '',
    password: '',
  };

  // Íconos...
  faUser = faUser;
  faEnvelope = faEnvelope;
  faLock = faLock;
  faUserPlus = faUserPlus;

  // URL de tu API de NestJS. Es mejor poner esto en los archivos de environment.
  private apiUrl = 'http://localhost:3002/auth/register'; // Reemplaza 3000 con tu puerto

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      // Marcar campos como tocados para mostrar errores
      Object.values(form.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    const userPayload = { ...this.user };

    console.log('Enviando al backend:', userPayload);

    // Aquí ocurre la magia: llamamos a la API
    this.http.post(this.apiUrl, userPayload).subscribe({
      // Callback para cuando la petición es exitosa
      next: (response) => {
        console.log('Usuario registrado exitosamente:', response);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');

        // Navegamos al usuario a la página de login
        this.router.navigate(['/in']);
      },
      // Callback para cuando hay un error
      error: (err) => {
        console.error('Error en el registro:', err);
        // El backend probablemente devuelva un error con un mensaje específico
        alert(
          `Error: ${err.error.message || 'No se pudo completar el registro.'}`
        );
      },
    });
  }
}
