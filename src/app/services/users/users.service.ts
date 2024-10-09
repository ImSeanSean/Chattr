import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mainPort } from '../../app.component';
import { Observable } from 'rxjs';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  getUser(): Observable<User> {
    return this.http.get<User>(`${mainPort}/pdo/api/get_users`);
  }
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${mainPort}/pdo/api/get_users`);
  }
  // uploadProfilePhoto(): Observable<any> {
  //   return null;
  // }
}
