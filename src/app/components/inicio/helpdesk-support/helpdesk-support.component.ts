import { Component } from '@angular/core';
import { FeatureSectionComponent } from '../../../shared/feature-section/feature-section.component';
import { TeamFormLiteComponent } from '../../team-form-lite/team-form-lite.component';
import { FooterComponent } from '../../footer/footer.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-helpdesk-support',
  imports: [FeatureSectionComponent, TeamFormLiteComponent, FooterComponent, TranslatePipe],
  templateUrl: './helpdesk-support.component.html',
})
export class HelpdeskSupportComponent {

}
