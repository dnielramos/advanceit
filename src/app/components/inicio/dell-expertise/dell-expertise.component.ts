import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dell-expertise',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dell-expertise.component.html',
})
export class DellExpertiseComponent {}

