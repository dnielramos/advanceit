import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookies-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookies-info.component.html',
})
export class CookiesInfoComponent implements OnInit {
  showBanner = false;

  private readonly storageKey = 'advanceit_cookies_accepted';

  ngOnInit(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.showBanner = stored !== 'true';
    } catch {
      this.showBanner = true;
    }
  }

  acceptCookies(): void {
    try {
      localStorage.setItem(this.storageKey, 'true');
    } catch {
      // ignore
    }
    this.showBanner = false;
  }
}

