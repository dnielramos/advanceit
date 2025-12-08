import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dell-partner-hero',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './dell-partner-hero.component.html',
})
export class DellPartnerHeroComponent {}

