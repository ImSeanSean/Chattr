import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../services/users/users.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { Message } from '../../interfaces/message';
import { User } from '../../interfaces/user';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { mainPort } from '../../app.component';
import { SidebarService } from '../../services/sidebar/sidebar.service';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [RouterModule, NgFor, NgIf, FormsModule, NgClass],
  templateUrl: './chat-layout.component.html',
  styleUrls: ['./chat-layout.component.css'],
})
export class ChatLayoutComponent {
  user: User[] = [];
  users: User[] = [];
  chatTitle = 'The Chatter';
  username = localStorage.getItem('username');
  userid = localStorage.getItem('userid');
  activeChatList = 'recents';
  imageUrl = '';
  loaded: Boolean = false;
  mainport = mainPort;
  isSidebarHidden: boolean = false;
  chatterMessages = false;
  privateUnreadCounts: { [key: string]: number } = {};

  constructor(
    private websocket: WebsocketService,
    private authentication: AuthenticationService,
    private userService: UsersService,
    private router: Router,
    private http: HttpClient,
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
    this.getUser();
  }

  getUser() {
    this.http
      .get<User[]>(`${mainPort}/pdo/api/get_users/${this.userid}`)
      .subscribe((user: User[]) => {
        this.user = user;
        this.imageUrl = user[0].profile;
        this.loaded = true;
      });

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

  changeProfilePhoto(): void {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    // Trigger the file input dialog
    fileInput.click();

    // Add an event listener to handle the file selection
    fileInput.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Update the imageUrl for immediate feedback
          this.imageUrl = e.target.result;

          // Prepare the image for upload
          const profileImage = new FormData();
          if (this.userid != null) {
            profileImage.append('image', file);
            profileImage.append('userid', this.userid);
          }
          // Upload the photo to the server
          this.http
            .post(`${mainPort}/pdo/api/upload_profile/`, profileImage)
            .subscribe({
              next: (response) => {},
              error: (error) => {
                console.error('Error uploading profile photo:', error);
              },
            });
        };

        // Read the image as a data URL for immediate display
        reader.readAsDataURL(file);
      }
    });
  }
  toggleSidebar() {
    this.sidebarService.toggleSideBar();
  }
}
