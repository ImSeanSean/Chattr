import { Component, ElementRef, Input, input, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../interfaces/user';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Message } from '../../interfaces/message';
import { MessageService } from '../../services/message/message.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-the-chatter',
  standalone: true,
  imports: [NgFor, FormsModule, NgClass, NgIf],
  templateUrl: './the-chatter.component.html',
  styleUrl: './the-chatter.component.css'
})
export class TheChatterComponent implements OnInit{
  @ViewChild('messageList') private messageList!: ElementRef;

  // Variables
  users: User[] = [];
  username = localStorage.getItem('username');
  userid = localStorage.getItem('userid');
  active: User[] = [];
  message: string = "";
  messages: Message[] = [];

  constructor(
    private userService: UsersService,
    private messageService: MessageService,
    private webSocketService: WebsocketService,
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.messageService.retrieveChatterMessage().subscribe((result: Message[]) => {
      this.messages.push(...result);
      this.scrollToBottom();
    });
    //Get Active
    this.webSocketService.getActive().subscribe((activeUsers: User[]) => {
      this.active = activeUsers;
    });
    //Get Message
    this.webSocketService.getMessages().subscribe((message: Message) => {
      this.messages.push(message);
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  getUsers() {
    this.userService.getUsers().subscribe((result: User[]) => {
      this.users = result;
    });
  }

  sendMessage(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (this.message.trim() !== '') {
        event.preventDefault();
        // Set JSON
        let messageJSON = {
          type: 'global',
          username: this.username!,
          message: this.message
        };
        this.webSocketService.send(messageJSON);
        this.messages.push(messageJSON);
        // Store Message
        this.messageService.storeChatterMessage(2, this.username!, this.message).subscribe(result => {
          
        });
        // Clear Textbox
        this.message = "";
        this.scrollToBottom();
      }
    }
  }

  private scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;0
    } catch (err) {
      console.error('Scroll to bottom error:', err);
    }
  }
}
