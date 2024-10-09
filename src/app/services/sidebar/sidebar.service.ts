import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private isSidebarHidden = false;

  private isSidebarHiddenSubject = new BehaviorSubject<boolean>(
    this.isSidebarHidden
  );
  isSidebarHidden$ = this.isSidebarHiddenSubject.asObservable();

  toggleSideBar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
    this.isSidebarHiddenSubject.next(this.isSidebarHidden);
  }
}
