import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dell-expertise',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './dell-expertise.component.html',
})
export class DellExpertiseComponent {}

