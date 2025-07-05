import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChevronRight,
  faCopyright,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { CategoryResponse } from '../../../services/product.service';
import { AdvanceProductsService } from '../../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './category.component.html',
})
export class CategoryMenuComponent implements OnInit {
  faChevronRight = faChevronRight;
  faArrowLeft = faArrowLeft;
  faCopyright = faCopyright;

  categories: { name: string; quantity: number }[] = [];
  currentCategory: { name: string; quantity: number } | null = null;

  constructor(
    private categoryService: AdvanceProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCategories();
  }

  goToCategory(cat: string) {
    // Usamos `router.navigate()` para construir la URL y navegar.
    // El primer elemento del array es la parte base de la ruta ('/productos').
    // El segundo elemento es el parámetro de la ruta (la categoría).
    this.router.navigate(['/productos', cat]);

    // Opcional: Para ver que la navegación se está ejecutando
    console.log(`Navegando a la categoría: /productos/${cat}`);
  }

  getCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (response: CategoryResponse) => {
        this.categories = response.categories;
      },
      error: (err) => {
        console.error('Error al obtener categorías:', err);
      },
    });
  }

  selectedCategory() {
    return this.currentCategory;
  }

  selectCategory(category: any) {
    this.currentCategory = category;
  }

  goBack() {
    this.currentCategory = null;
  }
}
