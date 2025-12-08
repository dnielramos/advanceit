import { Component } from '@angular/core';
import { HeroHeaderComponent } from '../../../components/hero-header/hero-header.component';
import { FeatureSectionComponent } from '../../../shared/feature-section/feature-section.component';
import { TopPositionsComponent } from '../../../components/top-positions/top-positions.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-identity-access',
  imports: [
    HeroHeaderComponent,
    FeatureSectionComponent,
    TopPositionsComponent,
    FooterComponent,
  ],
  templateUrl: './identity-access.component.html',
})
export class IdentityAccessComponent {
  topPositions: any;
}
