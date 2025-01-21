import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Message } from '../../interfaces/message';
import { User } from '../../interfaces/user';
import { NgClass, NgFor, NgIf } from '@angular/common';
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

  constructor(private router: Router, private sidebarService: SidebarService) {
    this.sidebarService.isSidebarHidden$.subscribe((hidden) => {
      this.isSidebarHidden = hidden;
    });
  }

  incrementUnreadCount(senderId: string) {
    if (this.privateUnreadCounts[senderId]) {
      this.privateUnreadCounts[senderId]++;
    } else {
      this.privateUnreadCounts[senderId] = 1;
    }
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
    this.router.navigate(['']);
  }

  toggleSidebar() {
    this.sidebarService.toggleSideBar();
  }
}
