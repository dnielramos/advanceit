import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-gray-100 text-gray-800 px-6">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-lg text-center animate-fade-in">
        <div class="flex justify-center mb-4 text-purple-600 animate-bounce-slow">
          <fa-icon [icon]="faCheckCircle" class="text-6xl"></fa-icon>
        </div>
        <h1 class="text-3xl font-bold mb-4 text-purple-700">¡Gracias por tu compra!</h1>
        <p class="text-lg mb-6 text-gray-700">
          Hemos recibido tu orden exitosamente.<br>
          El sistema generará tu factura, notificará al equipo de bodega y preparará tu pedido.
        </p>
        <p class="text-sm text-gray-500 mb-2">
          Una vez confirmado el pedido, recibirás la factura por correo para su verificación y pago.
        </p>
        <div class="mt-6">
          <p class="text-sm text-gray-400">Serás redirigido a la tienda en <span class="font-bold">{{ seconds }}</span> segundos...</p>
        </div>
        <button
          (click)="goToStore()"
          class="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition duration-300"
        >
          Ir a la tienda ahora
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.8s ease-out forwards;
    }

    .animate-bounce-slow {
      animation: bounce 2s infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  seconds = 10;
  interval: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.seconds--;
      if (this.seconds === 0) {
        this.goToStore();
      }
    }, 1000);
  }

  goToStore(): void {
    clearInterval(this.interval);
    this.router.navigate(['/productos']); // Ajusta la ruta si es diferente
  }
}
