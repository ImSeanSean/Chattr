import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService } from '../../services/users/users.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { Message } from '../../interfaces/message';
import { User } from '../../interfaces/user';
import { NgFor, NgIf } from '@angular/common';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [RouterModule, NgFor, NgIf, FormsModule],
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.css',
})
export class ChatLayoutComponent {
  users: User[] = [];
  chatTitle = 'The Chatter';
  username = localStorage.getItem('username');
  activeChatList = 'recents';

  constructor(
    private websocket: WebsocketService,
    private authentication: AuthenticationService,
    private userService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.websocket.connect();
    this.websocket.getActiveUsers();
    this.websocket.addCloseEventListener();
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe((result: User[]) => {
      this.users = result;
      this.users = this.users.filter((user) => user.username !== this.username);
    });
  }

  navigateChatterChat() {
    this.router.navigate(['/chats/the-chatter']);
    this.chatTitle = 'The Chatter';
  }

  navigatePrivateChat(userid: any, username: string) {
    this.router.navigate(['/chats/p', userid]);
    this.chatTitle = username;
  }

  logout() {
    this.authentication.logout();
  }
}
