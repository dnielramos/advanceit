import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Importa HttpClientModule
import { AdvanceProductsService } from '../../../services/product.service';
import { ProductoIngram } from '../../../models/ingram';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTag, faBoxesStacked, faMoneyBillWave, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'; // Iconos de ejemplo
import { IngramService } from '../../../services/ingram.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FontAwesomeModule], // Añade HttpClientModule y FontAwesomeModule aquí
  templateUrl: './add-products.component.html',
})
export class AddProductsComponent implements OnInit {
  products: ProductoIngram[] = [];
  loading: boolean = true;
  error: string | null = null;

  // Iconos de Font Awesome
  faTag = faTag;
  faBoxesStacked = faBoxesStacked;
  faMoneyBillWave = faMoneyBillWave;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  constructor(private productService: IngramService) { }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los productos. Inténtalo de nuevo más tarde.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
