import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faPhoneVolume } from '@fortawesome/free-solid-svg-icons';
import { HeroHeaderComponent } from "../../../components/hero-header/hero-header.component";
import { RouterLink } from '@angular/router';
import { FooterComponent } from "../../../components/footer/footer.component";
import { TranslatePipe, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

interface CaseStudy {
  id: number;
  category: string; // clave de traducción
  title: string; // clave de traducción
  description: string; // clave de traducción
  image: string;
  link?: string;
  // campos traducidos
  categoryTranslated?: string;
  titleTranslated?: string;
  descriptionTranslated?: string;
}

@Component({
  standalone: true,
  selector: 'app-white-papers',
  imports: [CommonModule, FormsModule, FontAwesomeModule, HeroHeaderComponent, RouterLink, FooterComponent, TranslatePipe],
  templateUrl: './white-papers.component.html',
})
export class WhitepaperComponent implements OnInit, OnDestroy {
  faArrowRight = faArrowRight;
  faPhoneVolume = faPhoneVolume;

  // datos base (claves de traducción)
  caseStudies: CaseStudy[] = [
    {
      id: 1,
      category: 'resources.whitePapers.wp1.category',
      title: 'resources.whitePapers.wp1.title',
      description: 'resources.whitePapers.wp1.description',
      image: 'https://techpoint.org/wp-content/uploads/2019/06/stanley-black-decker-logo-1024x483.png',
      link: 'contacto',
    },
    {
      id: 2,
      category: 'resources.whitePapers.wp2.category',
      title: 'resources.whitePapers.wp2.title',
      description: 'resources.whitePapers.wp2.description',
      image: 'https://mlt.org/wp-content/uploads/2020/11/Biogen-Logo.png',
      link: 'contacto',
    },
    {
      id: 4,
      category: 'resources.whitePapers.wp4.category',
      title: 'resources.whitePapers.wp4.title',
      description: 'resources.whitePapers.wp4.description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Takeda_Pharmaceutical_Company_logo.svg/2560px-Takeda_Pharmaceutical_Company_logo.svg.png',
      link: 'contacto',
    },
    {
      id: 5,
      category: 'resources.whitePapers.wp5.category',
      title: 'resources.whitePapers.wp5.title',
      description: 'resources.whitePapers.wp5.description',
      image: 'https://jdrfixtures.com/wp-content/uploads/2020/01/client-logo-shire.png',
      link: 'contacto',
    },
    {
      id: 6,
      category: 'resources.whitePapers.wp6.category',
      title: 'resources.whitePapers.wp6.title',
      description: 'resources.whitePapers.wp6.description',
      image: 'https://d2c0db5b8fb27c1c9887-9b32efc83a6b298bb22e7a1df0837426.ssl.cf2.rackcdn.com/16327740-traffix-high-performance-logist-4000x1200.jpeg',
      link: 'contacto',
    },
    {
      id: 7,
      category: 'resources.whitePapers.wp7.category',
      title: 'resources.whitePapers.wp7.title',
      description: 'resources.whitePapers.wp7.description',
      image: 'https://masiv.com/wp-content/uploads/2025/03/Logo-Horizontal-Masiv.png',
      link: 'contacto',
    },
  ];

  // categorías dinámicas (key = clave original, label = texto traducido)
  categories: { key: string; label: string }[] = [];

  // filtros
  searchTerm = '';
  selectedCategories: string[] = [];

  private langSub?: Subscription;

  constructor(private translate: TranslateService) {}

  async ngOnInit() {
    await this.refreshTranslations();

    // actualizar automáticamente si el idioma cambia en la app
    this.langSub = this.translate.onLangChange.subscribe(async (ev: LangChangeEvent) => {
      await this.refreshTranslations();
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  // recarga traducciones para caseStudies y genera categorías dinámicas
  private async refreshTranslations() {
    // traducir cada item
    const translated = await Promise.all(
      this.caseStudies.map(async (item) => ({
        ...item,
        categoryTranslated: await this.translate.get(item.category).toPromise(),
        titleTranslated: await this.translate.get(item.title).toPromise(),
        descriptionTranslated: await this.translate.get(item.description).toPromise(),
      }))
    );

    this.caseStudies = translated;

    // generar lista única de categorías traducidas a partir de los caseStudies
    const map = new Map<string, { key: string; label: string }>();
    for (const item of this.caseStudies) {
      const label = item.categoryTranslated ?? (await this.translate.get(item.category).toPromise());
      const key = item.category; // la clave original para id
      if (!map.has(label)) {
        map.set(label, { key, label });
      }
    }
    this.categories = Array.from(map.values());

    // Si alguna categoría seleccionada dejó de existir (por cambio de idioma), limpiarla
    this.selectedCategories = this.selectedCategories.filter((sel) =>
      this.categories.some((c) => c.label === sel)
    );
  }

  // contador legible (puedes mantener traducción si prefieres)
  get totalResultsText(): string {
    return `Showing ${this.filteredCaseStudies.length} results of ${this.caseStudies.length} posts.`;
  }

  // items filtrados
  get filteredCaseStudies(): CaseStudy[] {
    return this.caseStudies.filter((item) => {
      const matchesSearch = this.matchesSearchTerm(item);
      const matchesCategory = this.matchesSelectedCategories(item);
      return matchesSearch && matchesCategory;
    });
  }

  private matchesSearchTerm(item: CaseStudy): boolean {
    if (!this.searchTerm) return true;
    const term = this.searchTerm.toLowerCase();
    return (
      (item.titleTranslated ?? '').toLowerCase().includes(term) ||
      (item.categoryTranslated ?? '').toLowerCase().includes(term) ||
      (item.descriptionTranslated ?? '').toLowerCase().includes(term)
    );
  }

  private matchesSelectedCategories(item: CaseStudy): boolean {
    if (this.selectedCategories.length === 0) return true;
    // comparamos por label traducido
    const label = item.categoryTranslated ?? '';
    return this.selectedCategories.includes(label);
  }

  // manejo del cambio de checkbox
  onCategoryChange(categoryLabel: string, event: any) {
    const checked = event.target.checked;
    if (checked) {
      if (!this.selectedCategories.includes(categoryLabel)) {
        this.selectedCategories = [...this.selectedCategories, categoryLabel];
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter((c) => c !== categoryLabel);
    }
  }

  // helper: para controlar el checked del input en la vista
  isCategorySelected(label: string) {
    return this.selectedCategories.includes(label);
  }
}
