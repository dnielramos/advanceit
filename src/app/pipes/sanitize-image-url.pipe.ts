import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sanitizeImageUrl'
})
export class SanitizeImageUrlPipe implements PipeTransform {
  transform(url: string): string {
    if (!url) return '';
    // Remover extensiones duplicadas como .jpg.jpg o .png.png
    return url.replace(/(\.\w+)\1$/, '$1');
  }
}
