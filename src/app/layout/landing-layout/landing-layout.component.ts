import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { RouterOutlet } from '@angular/router';
import { CookiesInfoComponent } from "../../components/terms/cookies-info/cookies-info.component";

@Component({
  selector: 'app-landing-layout',
  imports: [NavbarComponent, RouterOutlet, CookiesInfoComponent],
  templateUrl: './landing-layout.component.html',
})
export class LandingLayoutComponent {

}
