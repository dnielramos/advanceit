import { Component } from '@angular/core';
import { FooterComponent } from "../../../components/footer/footer.component";
import { HeroHeaderComponent } from "../../../components/hero-header/hero-header.component";
import { FeatureSectionComponent } from "../../../shared/feature-section/feature-section.component";
import { TopPositionsComponent } from "../../../components/top-positions/top-positions.component";

@Component({
  selector: 'app-procurement-logistics',
  imports: [FooterComponent, HeroHeaderComponent, FeatureSectionComponent, TopPositionsComponent],
  templateUrl: './procurement-logistics.component.html',
})
export class ProcurementLogisticsComponent {
topPositions: any;

}
