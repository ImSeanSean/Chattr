import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Message } from '../../interfaces/message';
import { HttpClient } from '@angular/common/http';
import { mainPort } from '../../app.component';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private messages = new Subject<Message>();
  private privateMessages = new Subject<Message>();
  private connection = new Subject<boolean>();
  private activeUsers = new BehaviorSubject<User[]>([]);
  private username = localStorage.getItem('username');
  private userid = localStorage.getItem('userid');

  constructor(private http: HttpClient){
    this.connect();
    this.getActiveUsers();
    this.addCloseEventListener();
  }

  connect(){
    this.socket = new WebSocket('ws://localhost:8080');

    let username = localStorage.getItem('username');

    this.socket.onopen = () => {
      this.connection.next(true);
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      let data: Message = JSON.parse(event.data);

      // If Ask for Status
      if(data.type === 'status'){
        this.sendActive(username!);
        this.changeActive();
        this.getActiveUsers();
      }
      // If Active Users Changed
      if(data.type === 'active'){
        this.getActiveUsers();
      }
      // If Global Message
      if(data.type === 'global'){
        this.messages.next(data);
      }
      // If Private Message
      if(data.type === 'private'){
        console.log("Message Received")
        this.privateMessages.next(data);
      }
    }

    this.socket.onerror = (event: Event) => {
      console.error(event);
    }

    this.socket.onclose = (event: CloseEvent) => {
      this.connection.next(false);
      console.log('WebSocket connection closed');
      this.changeOffline();
    }

    return () => this.socket.close();
  }

  // Get Observables
  getConnection(): Observable<boolean>{
    return this.connection.asObservable();
  }

  getActive(): Observable<User[]> {
    return this.activeUsers.asObservable();
  }

  getMessages(): Observable<Message> {
    return this.messages.asObservable();
  }

  getPrivateMessages(): Observable<Message> {
    return this.privateMessages.asObservable();
  }

  // Active
  sendActive(username: string){
    this.changeActive();
    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      let data = {
        type: 'active',
        username: username,
        message: `${username} is now active.`
      }
      this.socket.send(JSON.stringify(data));
    }

    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      let data = {
        type: 'register',
        username: username,
        message: `${username}'s connection added.`
      }
      this.socket.send(JSON.stringify(data));
    }
  }

  changeActive(){
    let data = {
      userid: this.userid
    };
    this.http.post(`${mainPort}/pdo/api/change_active`, data).subscribe(result => {
      this.getActiveUsers();
    });
  }

  changeOffline(){
    let data = {
      userid: this.userid
    };
    this.http.post(`${mainPort}/pdo/api/change_offline`, data).subscribe(result => {
      console.log('User status changed to offline');
    });
  }

  getActiveUsers(){
    this.http.get<User[]>(`${mainPort}/pdo/api/get_active_users`).subscribe((result: User[]) => {
      this.activeUsers.next(result); 
    });
  }

  // Send Message
  send(message: Message){
    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      this.socket.send(JSON.stringify(message));
    }
  }

  sendPrivate(chatterUsername: string, message: string){
    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      let data = {
        type: 'private',
        username: this.username,
        chatterUsername: chatterUsername,
        message: message
      }
      this.socket.send(JSON.stringify(data));
    }
  }

  // Close Connection if Tab Closes
  private addCloseEventListener(){
    window.addEventListener('beforeunload', () => {
      if(this.socket && this.socket.readyState === WebSocket.OPEN){
        this.changeOffline(); 
        this.socket.close();
      }
    });
  }
}
