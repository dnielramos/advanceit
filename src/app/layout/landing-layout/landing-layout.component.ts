import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-landing-layout',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './landing-layout.component.html',
})
export class LandingLayoutComponent {

}
