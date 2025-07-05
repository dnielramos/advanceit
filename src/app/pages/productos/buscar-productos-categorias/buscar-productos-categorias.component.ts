import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdvanceProductsService } from '../../../services/product.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ProductAdvance } from '../../../models/ingram';
import { NexsysProduct, Producto } from '../../../models/Productos';
import { SanitizeImageUrlPipe } from '../../../pipes/sanitize-image-url.pipe';
import { AdvanceProductsComponent } from '../../dashboard/advance-products/advance-products.component';
import { ProductAdvanceComponent } from '../../../components/products/product-advance/product-advance.component';
import { BrandService } from '../../../services/brand.service';
// Importa las interfaces correctas

@Component({
  selector: 'app-buscar-productos-categorias',
  standalone: true,
  imports: [
    CommonModule,
    SanitizeImageUrlPipe,
    AdvanceProductsComponent,
    ProductAdvanceComponent,
  ],
  templateUrl: './buscar-productos-categorias.component.html',
})
export class BuscarProductosCategoriasComponent implements OnInit {
  category: string | null = null;
  // Ahora productosCategoria será un array de ProductAdvancedData
  productosCategoria: Producto[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: AdvanceProductsService,
    private brandService : BrandService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.category = params.get('category');
          console.log(
            'Categoría de productos al iniciar/cambiar:',
            this.category
          );

          if (this.category) {
            return this.productService
              .getAllProducts()
              .pipe(
                map((allProducts) =>
                  allProducts.filter(
                    (p) =>
                      p.categoria.toLowerCase() === this.category?.toLowerCase()
                  )
                )
              );
          } else {
            return of([]);
          }
        }),
        map((products) => {
          // Asegúrate de que las marcas estén cargadas en el BrandService antes de mapear
          const brands = this.brandService.brands || [];

          return products.map((producto) => {
            const brand = brands.find(
              (b) =>
                b.name.trim().toLowerCase() ===
                producto.marca.trim().toLowerCase()
            );
            return {
              ...producto,
              marca: brand ? brand.url : producto.marca, // Si no se encuentra, se deja como estaba
            };
          });
        })
      )
      .subscribe({
        next: (products) => {
          this.productosCategoria = products;
          console.log(
            'Productos con marca transformada:',
            this.productosCategoria
          );
        },
        error: (err) => {
          console.error('Error al obtener productos:', err);
        },
      });
  }
}
