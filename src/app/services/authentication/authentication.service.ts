import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mainPort } from '../../app.component';
import { User } from '../../interfaces/user';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient, private router: Router) {}

  login(data: Object): Observable<boolean> {
    return this.http.post<User>(`${mainPort}/pdo/api/login`, data).pipe(
      map((result) => {
        if (result) {
          console.log(result.username);
          localStorage.setItem('username', result.username);
          localStorage.setItem('email', result.email);
          localStorage.setItem('userid', result.userid);
          return true;
        } else {
          return false;
        }
      }),
      catchError((error) => {
        console.error(error);
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('userid');
    this.router.navigate(['']);
  }
}
