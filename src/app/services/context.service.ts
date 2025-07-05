import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContextService {
  private navVisibleSubject = new BehaviorSubject<boolean>(true);
  nav$ = this.navVisibleSubject.asObservable();

  setNavVisibility(value: boolean) {
    this.navVisibleSubject.next(value);
  }
}
