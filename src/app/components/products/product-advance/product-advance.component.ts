import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faCopyright,
  faShoppingCart,
  faEye,
  faCheck,
  faLayerGroup,
  faTag,
  faCodeBranch,
  faWandSparkles
} from '@fortawesome/free-solid-svg-icons';
import { ProductoFinal } from '../../../models/Productos';
import { Router, RouterLink } from '@angular/router';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';
import { AuthService, Role } from '../../../services/auth.service';
import { LogoPipe } from '../../../pipes/logo.pipe';
import { FormsModule } from '@angular/forms';
import { GeminiTextService, Product } from '../../../services/generation/gemini-text.service';

@Component({
  selector: 'app-product-advance',
  imports: [CommonModule, FontAwesomeModule, SanitizeImageUrlPipe, LogoPipe, FormsModule],
  templateUrl: './product-advance.component.html',
})
export class ProductAdvanceComponent implements OnChanges {

  @Input() productosFiltrados: ProductoFinal[] = [];
  @Input() producto!: ProductoFinal;
  @Output() agregarAlCarrito = new EventEmitter<ProductoFinal>();

  // 1. Crea una propiedad para almacenar las etiquetas que se mostrarán
  etiquetasMostradas: string[] = [];

  // 2. Implementa el método ngOnChanges
  ngOnChanges(changes: SimpleChanges) {
    // Revisa si el input 'producto' ha cambiado
    if (changes['producto'] && changes['producto'].currentValue) {
      this.procesarEtiquetas();
    }
  }

  // Estado para la generación de texto (no rompe nada existente)
  isLoadingText: boolean = false;
  descripcionGenerada: string | null = null;


  logged: boolean = true;

  faWandSparkles = faWandSparkles;
  faShoppingCart = faShoppingCart;
  faEye = faEye;
  faSearch = faSearch;
  faLayerGroup = faLayerGroup;
  faTag = faTag;
  faCopyright = faCopyright;
  faCodeBranch = faCodeBranch;
  faCircleCheck = faCheck;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private geminiTextService: GeminiTextService,
    private cdr: ChangeDetectorRef
  ) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.logged = isLoggedIn;
    });
  }


  // 3. Mueve la lógica de procesamiento a una función separada
  private procesarEtiquetas() {
    const etiquetas = this.producto.etiquetas;
    let etiquetasArray: string[] = [];

    if (typeof etiquetas === 'string') {
      try {
        const parsed = JSON.parse(etiquetas);
        etiquetasArray = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        etiquetasArray = [];
      }
    } else if (Array.isArray(etiquetas)) {
      etiquetasArray = etiquetas;
    }

    if (etiquetasArray.length <= 4) {
      this.etiquetasMostradas = etiquetasArray;
    } else {
      // La lógica aleatoria se ejecuta UNA SOLA VEZ y se guarda
      const shuffled = [...etiquetasArray].sort(() => 0.5 - Math.random());
      this.etiquetasMostradas = shuffled.slice(0, 4);
    }
  }

  navigateToProductDetail(producto: ProductoFinal) {
    console.log('Navegar a detalle de producto:', producto);
    const productDetailUrl = `/productos/${producto.id}`;
    this.router.navigateByUrl(productDetailUrl);
  }

  addToCart(event: Event, producto: ProductoFinal) {
    //evitar propagacion de evento
    event.stopPropagation();
    console.log('Añadir al carrito:', producto);
    this.agregarAlCarrito.emit(producto);
  }

  get safeCaracteristicas(): string[] {
    const caracteristicas = this.producto["caracteristicas"];
    // Caso 1: Los datos vienen como un string que parece un array (el error actual)
    if (typeof caracteristicas === 'string') {
      try {
        const parsed = JSON.parse(caracteristicas);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // Si no se puede parsear, devolvemos un array vacío para no romper la app
        return [];
      }
    }

    // Caso 2: Los datos vienen correctamente como un array (o son nulos/indefinidos)
    return Array.isArray(caracteristicas) ? caracteristicas : [];
  }

  // Modal state
  showLunaModal: boolean = false;
  modalLoadingStage: number = 0;
  modalText: string = '';
  isTyping: boolean = false;

  async generarDescripcionTexto(event: Event): Promise<void> {
    event?.stopPropagation();

    if (!this.logged) {
      console.log('Usuario no logueado');
      return;
    }

    if (!this.producto?.nombre || !this.producto?.descripcion) {
      console.log('Producto sin datos necesarios');
      return;
    }

    const limits = this.geminiTextService.getRateLimits();
    const usage = this.geminiTextService.rateLimitInfo();
    if (usage.remainingRequests <= 0) {
      console.log('Límite de requests excedido');
      return;
    }

    // Open modal and start loading sequence
    this.showLunaModal = true;
    this.modalLoadingStage = 1;
    this.modalText = '';
    this.isTyping = false;
    this.cdr.detectChanges(); // Forzar detección de cambios

    console.log('Iniciando generación de descripción...');

    try {
      // Ejecutar las etapas de loading en paralelo con la llamada a la API
      const loadingPromise = this.simulateLoadingStages();
      
      const productData: Product = {
        id: String(this.producto.id ?? ''),
        name: this.producto.nombre ?? '',
        description: this.producto.descripcion ?? '',
        category: this.producto.categoria ?? '',
        price: Number(this.producto.precio ?? 0),
        features: this.safeCaracteristicas?.slice(0, 5) ?? [],
        useCases: this.getUseCases()
      };

      console.log('Producto a enviar:', productData);

      const observable = this.geminiTextService.generateProductDescription(productData, 'es-ES');
      
      // Esperar a que termine el loading y la API en paralelo
      const [_, response] = await Promise.all([
        loadingPromise,
        this.geminiTextService.toPromise(observable)
      ]);

      console.log('Respuesta recibida:', response);

      if (response?.text) {
        this.modalLoadingStage = 0;
        this.cdr.detectChanges(); // CRÍTICO: Forzar detección de cambios
        console.log('Modal stage actualizado a 0, iniciando typewriter...');
        await this.typewriterEffect(response.text);
        console.log('Efecto de escritura completado');
      } else {
        throw new Error('La API no devolvió texto válido.');
      }

    } catch (err: any) {
      console.error('Error al generar descripción:', err);
      this.modalLoadingStage = 0;
      this.modalText = 'Lo siento, hubo un error al generar la descripción. Por favor, intenta de nuevo.';
      this.cdr.detectChanges(); // Forzar detección de cambios en error
      
      // Mostrar el error por 3 segundos antes de cerrar
      setTimeout(() => {
        if (this.modalText.includes('error')) {
          this.closeModal();
        }
      }, 3000);
    }
  }

  private async simulateLoadingStages(): Promise<void> {
    const stages = [
      { stage: 1, duration: 800, text: 'Analizando producto...' },
      { stage: 2, duration: 1000, text: 'Consultando white papers...' },
      { stage: 3, duration: 800, text: 'Generando descripción...' }
    ];

    for (const { stage, duration } of stages) {
      this.modalLoadingStage = stage;
      this.cdr.detectChanges(); // Forzar detección en cada stage
      console.log(`Stage ${stage}/${stages.length}`);
      await new Promise(resolve => setTimeout(resolve, duration));
    }
    
    console.log('Loading stages completados');
  }

  private async typewriterEffect(text: string): Promise<void> {
    this.isTyping = true;
    this.modalText = '';
    this.cdr.detectChanges(); // Forzar detección al iniciar
    
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      this.modalText += (i > 0 ? ' ' : '') + words[i];
      
      // Forzar detección de cambios cada 10 palabras para mejor performance
      if (i % 10 === 0) {
        this.cdr.detectChanges();
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    this.isTyping = false;
    this.cdr.detectChanges(); // Forzar detección al finalizar
    console.log('Typewriter effect completado');
  }

  closeModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    console.log('Cerrando modal');
    this.showLunaModal = false;
    this.modalLoadingStage = 0;
    this.modalText = '';
    this.isTyping = false;
    this.cdr.detectChanges(); // Forzar detección al cerrar
  }

  private getUseCases(): string[] {
    return [
      'Uso profesional',
      'Uso empresarial',
      'Proyectos de tecnología'
    ];
  }

}