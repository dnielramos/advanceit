// Archivo: product-skeleton.component.ts
// HTML y TypeScript combinados en un solo archivo.

import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-filter-product',
  // En lugar de 'templateUrl', usamos la propiedad 'template' con backticks (`)
  // para definir el HTML directamente aquí.
  template: `
    <div class="border border-gray-200 rounded-lg p-4 shadow-sm w-full h-full">
      <div class="animate-pulse flex flex-col h-full">

        <!-- Placeholder para la Imagen/Logo del producto -->
        <div class="mx-auto bg-gray-300 h-24 w-40 rounded mb-4"></div>

        <!-- Placeholder para el Título del producto -->
        <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>

        <!-- Placeholder para la Descripción corta -->
        <div class="h-3 bg-gray-300 rounded w-full mb-2"></div>
        <div class="h-3 bg-gray-300 rounded w-5/6 mb-4"></div>

        <!-- Div espaciador para empujar el botón hacia la parte inferior de la tarjeta -->
        <div class="flex-grow"></div>

        <!-- Placeholder para las etiquetas (tags) como "Servicios" o "IGCO" -->
        <div class="flex items-center space-x-2 mb-4">
          <div class="h-5 bg-gray-300 rounded w-20"></div>
          <div class="h-5 bg-gray-300 rounded w-16"></div>
        </div>

        <!-- Placeholder para el botón de "Comprar" -->
        <div class="h-10 bg-purple-200 rounded w-full"></div>

      </div>
    </div>
  `
  // Ya no necesitamos 'styleUrls' si no tienes estilos específicos.
})
export class SkeletonFilterProductComponent {
  // Este componente es puramente visual, por lo que no necesita lógica en su clase.
}
