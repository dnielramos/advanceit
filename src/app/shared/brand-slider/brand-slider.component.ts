import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-brand-slider',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="marquee-container mt-12">
      <div class="marquee">
        <ng-container *ngFor="let brand of brandsDoubled">
          <img
            [src]="brand"
            [alt]="'brand-' + brand"
            class="w-20 mx-4 object-contain"
          />
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      /* Contenedor externo: oculta el overflow para que no aparezcan scrollbars */
      .marquee-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        background-color: white;
        padding: 1rem 0;
      }

      /* Contenedor que “viaja” horizontalmente */
      .marquee {
        display: inline-flex; /* Mantiene las imágenes en línea */
        /* Animación de 30s lineal, se repite infinitamente */
        animation: marquee 120s linear infinite;
      }

      /* Al llegar al 100%, regresa a 0.
         Visualmente no hay “salto” porque la segunda mitad es idéntica a la primera. */
      @keyframes marquee {
        0% {
          transform: translateX(10);
        }
        100% {
          transform: translateX(-180%);
        }
      }
    `,
  ],
})
export class BrandSliderComponent {
  @Input() brands  = [
  'assets/logos/samsung.avif',
  'assets/logos/adobe.png',
  'assets/logos/apple.png',
  'assets/logos/asus corporativo.png',
  'assets/logos/barco.png',
  'assets/logos/checkpoint.png',
  'assets/logos/condeco.png',
  'assets/logos/dlink.png',
  'assets/logos/epson scanners.png',
  'assets/logos/honeywell.png',
  'assets/logos/jabra.png',
  'assets/logos/lenovo servers.png',
  'assets/logos/lg.png',
  'assets/logos/microsoft.png',
  'assets/logos/panasonic.png',
  'assets/logos/samsung.png',
  'assets/logos/tplink.png',
  'assets/logos/wacom.png',
  'assets/logos/acronis.webp',
  'assets/logos/epson consumo.webp',
  'assets/logos/wacom.jpg',
  'assets/logos/apc.png',
  'assets/logos/aruba.png',
  'assets/logos/autodesk.png',
  'assets/logos/canon.png',
  'assets/logos/citrix.png',
  'assets/logos/dell.png',
  'assets/logos/elo.png',
  'assets/logos/epson.png',
  'assets/logos/hp gran formato.png',
  'assets/logos/kaspersky.png',
  'assets/logos/lenovo.png',
  'assets/logos/logitech.png',
  'assets/logos/oracle.png',
  'assets/logos/redhat.png',
  'assets/logos/sophos.png',
  'assets/logos/viewsonic.png',
  'assets/logos/zebra.png',
  'assets/logos/asus.webp'
];

  // Duplicamos para que la animación sea continua
  brandsDoubled = [
    ...this.brands,
    ...this.brands,
    ...this.brands,
  ];
}
