import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mainPort } from '../../app.component';
import { Observable } from 'rxjs';
import { Message } from '../../interfaces/message';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private http: HttpClient) {}

  storeChatterMessage(userid: number, username: string, message: string) {
    let data = {
      userid: userid,
      username: username,
      message: message,
    };

    return this.http.post(`${mainPort}/pdo/api/store_chatter_message`, data);
  }
  retrieveChatterMessage(): Observable<Message[]> {
    return this.http.get<Message[]>(`${mainPort}/pdo/api/get_chatter_message`);
  }
}
