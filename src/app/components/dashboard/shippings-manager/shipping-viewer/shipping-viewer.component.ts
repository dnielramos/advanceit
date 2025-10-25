import { Component, Input, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../../../services/document.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-shipping-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipping-viewer.component.html',
  // Añadimos estilos al 'host' para que no ocupe espacio
  // hasta que sea visible (si se controla con un *ngIf)
  styles: [':host { display: contents; }']
})
export class ShippingViewerComponent implements OnInit {
  @Input({ required: true }) shippingId!: string;

  // ¡NUEVO! Output para notificar al padre que debe cerrar este modal
  @Output() close = new EventEmitter<void>();

  private readonly documentService = inject(DocumentService);
  private readonly sanitizer = inject(DomSanitizer);

  loading = true;
  error = '';
  documentUrl: SafeResourceUrl | null = null;

  async ngOnInit(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.documentService.getDocumentByShippingId(this.shippingId)
      );

      if (!response?.document) {
        this.error = 'No se encontró el comprobante (documento vacío).';
        this.loading = false;
        return;
      }

      // Asumimos que la API nos da el tipo correcto (ej. 'PNG', 'JPEG')
      const mimeType = this.getMimeType(response.type);
      const dataUrl = `${response.document}`;

      // Usamos 'bypassSecurityTrustUrl' para <img>.
      // 'bypassSecurityTrustResourceUrl' es para <iframes>.
      this.documentUrl = this.sanitizer.bypassSecurityTrustUrl(dataUrl);

    } catch (err) {
      console.error(err);
      if (err instanceof HttpErrorResponse) {
        this.error = `Error ${err.status}: No se pudo cargar el comprobante.`;
      } else {
        this.error = 'Error inesperado al cargar el comprobante.';
      }
    } finally {
      this.loading = false;
    }
  }

  /**
   * ¡NUEVO! Método para emitir el evento de cierre.
   */
  onClose(): void {
    this.close.emit();
  }

  private getMimeType(type: string): string {
    switch (type?.toUpperCase()) {
      case 'PDF':
        return 'application/pdf'; // Mantenido por si acaso
      case 'XML':
        return 'application/xml';
      case 'PNG':
        return 'image/png';
      case 'JPEG':
      case 'JPG':
        return 'image/jpeg';
      case 'GIF':
        return 'image/gif';
      case 'WEBP':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}

