import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statuscap',
  standalone: true
})
export class CapitalizeStatusPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Reemplazar guiones bajos y guiones por espacios
    const words = value
      .replace(/[_-]/g, ' ') // Reemplaza _ y - por espacio
      .toLowerCase()         // Todo a minúscula primero
      .split(' ')            // Divide en palabras
      .map(word =>
        word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : ''
      )
      .join(' ');

    return words;
  }
}
