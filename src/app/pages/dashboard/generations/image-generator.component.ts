// src/app/components/image-generator/image-generator.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiImageService } from '../../../services/generation/gemini-image.service';

@Component({
  selector: 'app-image-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-generator.component.html',
})
export class ImageGeneratorComponent implements OnInit, OnDestroy {
  prompt = '';
  generatedImageUrl: string | null = null;
  isLoading = false;
  error: string | null = null;
  rateLimits = { rpm: 0, tpm: 0, rpd: 0 };

  constructor(private geminiService: GeminiImageService) {}

  ngOnInit(): void {
    this.rateLimits = this.geminiService.getRateLimits();
  }

  generateImage(): void {
    if (!this.prompt.trim()) return;
    
    this.isLoading = true;
    this.error = null;

    this.geminiService.generateImage(this.prompt).subscribe({
      next: (imageData) => {
        // Limpiar URL anterior si existe
        if (this.generatedImageUrl) {
          this.geminiService.revokePreviewUrl(this.generatedImageUrl);
        }
        
        this.generatedImageUrl = this.geminiService.createPreviewUrl(imageData);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al generar la imagen';
        this.isLoading = false;
        console.error('Error en generación:', err);
      }
    });
  }

  downloadImage(): void {
    if (this.generatedImageUrl) {
      // Extraer el base64 de la URL del objeto
      // En un entorno real, deberías almacenar el base64 original
      const link = document.createElement('a');
      link.href = this.generatedImageUrl;
      link.download = `gemini-image-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      link.click();
    }
  }

  ngOnDestroy(): void {
    // Limpiar URL de objeto si existe
    if (this.generatedImageUrl) {
      this.geminiService.revokePreviewUrl(this.generatedImageUrl);
    }
  }
}