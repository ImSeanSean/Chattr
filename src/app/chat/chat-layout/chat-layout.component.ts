import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService } from '../../services/users/users.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { Message } from '../../interfaces/message';
import { User } from '../../interfaces/user';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [RouterModule, NgFor],
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.css'
})
export class ChatLayoutComponent {

  users: User[] = [];
  chatTitle = "The Chatter"


  constructor(
    private webSocketService: WebsocketService,
    private userService: UsersService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe((result: User[]) => {
      this.users = result;
    });
  }

  navigateChatterChat(){
    this.router.navigate(['/chats/the-chatter'])
    this.chatTitle = "The Chatter"
  }

  navigatePrivateChat(userid: any, username: string){
    this.router.navigate(['/chats/p', userid])
    this.chatTitle = username;
  }
}
