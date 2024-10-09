import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users/users.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { Message } from '../../interfaces/message';
import { User } from '../../interfaces/user';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/sidebar/sidebar.service';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [RouterModule, NgFor, NgIf, FormsModule, NgClass],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.css'],
})
export class ChatLayoutComponent {
  users: User[] = [];
  chatTitle = 'The Chatter';
  username = localStorage.getItem('username');
  activeChatList = 'recents';
  isSidebarHidden: boolean = false;
  chatterMessages = false;
  privateUnreadCounts: { [key: string]: number } = {};

  constructor(
    private websocket: WebsocketService,
    private authentication: AuthenticationService,
    private userService: UsersService,
    private router: Router,
    private sidebarService: SidebarService
  ) {
    this.sidebarService.isSidebarHidden$.subscribe((hidden) => {
      this.isSidebarHidden = hidden;
    });
  }

  ngOnInit(): void {
    this.websocket.connect();
    this.websocket.getActiveUsers();
    this.websocket.addCloseEventListener();
    this.getUsers();

    this.websocket.getPrivateMessages().subscribe((message: Message) => {
      if (!this.router.url.includes('chats/p')) {
        this.incrementUnreadCount(message.username);
      }
    });

    this.websocket.getMessages().subscribe((message: Message) => {
      if (message) {
        if (!this.router.url.includes('the-chatter')) {
          this.chatterMessages = true;
        }
      }
    });
  }

  incrementUnreadCount(senderId: string) {
    if (this.privateUnreadCounts[senderId]) {
      this.privateUnreadCounts[senderId]++;
    } else {
      this.privateUnreadCounts[senderId] = 1;
    }
  }

  getUsers() {
    this.userService.getUsers().subscribe((result: User[]) => {
      this.users = result.filter((user) => user.username !== this.username);
    });
  }

  navigateChatterChat() {
    this.router.navigate(['/chats/the-chatter']);
    this.chatTitle = 'The Chatter';
    this.chatterMessages = false;
  }

  navigatePrivateChat(userid: any, username: string) {
    this.router.navigate(['/chats/p', userid]);
    this.chatTitle = username;
    this.privateUnreadCounts[username] = 0;
  }

  logout() {
    this.authentication.logout();
  }

  toggleSidebar() {
    this.sidebarService.toggleSideBar();
  }
}
