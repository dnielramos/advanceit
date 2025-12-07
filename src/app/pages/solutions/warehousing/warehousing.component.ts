import { Component } from '@angular/core';
import { HeroHeaderComponent } from "../../../components/hero-header/hero-header.component";
import { FeatureSectionComponent } from "../../../shared/feature-section/feature-section.component";
import { TopPositionsComponent } from "../../../components/top-positions/top-positions.component";
import { FooterComponent } from "../../../components/footer/footer.component";

@Component({
  selector: 'app-warehousing',
  imports: [HeroHeaderComponent, FeatureSectionComponent, TopPositionsComponent, FooterComponent],
  templateUrl: './warehousing.component.html',
})
export class WarehousingComponent {

  topPositions = [
    {
      name: 'Data Entry Specialist',
      iconUrl:
        'https://cdn.prod.website-files.com/636a549426aa8438b3b45fa8/63a3aeeaf8cc91f2cd129379_01.svg'
    },
    {
      name: 'Track and Trace Coordinators',
      iconUrl:
        'https://cdn.prod.website-files.com/636a549426aa8438b3b45fa8/63a3aeeaf8cc91f2cd129379_01.svg'
    },
    {
      name: 'Pricing Specialists',
      iconUrl:
        'https://cdn.prod.website-files.com/636a549426aa8438b3b45fa8/63a3aeeaf8cc91f2cd129379_01.svg'
    },
    {
      name: 'Cargo Inspection Coordinators',
      iconUrl:
        'https://cdn.prod.website-files.com/636a549426aa8438b3b45fa8/63a3aeeaf8cc91f2cd129379_01.svg'
    },
    {
      name: 'Documentation Generation & Review Specialists',
      iconUrl:
        'https://cdn.prod.website-files.com/636a549426aa8438b3b45fa8/63a3aeeaf8cc91f2cd129379_01.svg'
    },
    {
      name: 'Cargo Inspection Coordinators',
      iconUrl:
        'https://cdn.prod.website-files.com/636a549426aa8438b3b45fa8/63a3aeeaf8cc91f2cd129379_01.svg'
    },
    {
      name: 'Documentation Generation & Review Specialists',
      iconUrl:
        'https://cdn.prod.website-files.com/636a549426aa8438b3b45fa8/63a3aeeaf8cc91f2cd129379_01.svg'
    }
  ];
}
