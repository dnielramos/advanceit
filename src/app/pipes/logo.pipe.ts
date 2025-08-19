import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'logo',
  standalone: true
})
export class LogoPipe implements PipeTransform {
  transform(brand: string): string {
    if (!brand) return 'https://advanceit.co/assets/logos/default.png'; // fallback si no tiene marca
    return `https://advanceit.co/assets/logos/${brand.toLowerCase()}.png`;
  }
}
