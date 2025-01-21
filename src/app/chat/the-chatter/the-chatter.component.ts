import {
  Component,
  ElementRef,
  Input,
  input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { User } from '../../interfaces/user';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Message } from '../../interfaces/message';
import { SidebarService } from '../../services/sidebar/sidebar.service';

@Component({
  selector: 'app-the-chatter',
  standalone: true,
  imports: [NgFor, FormsModule, NgClass, NgIf],
  templateUrl: './the-chatter.component.html',
  styleUrl: './the-chatter.component.css',
})
export class TheChatterComponent {
  @ViewChild('messageList') private messageList!: ElementRef;

  // Variables
  users: User[] = [];
  username = localStorage.getItem('username');
  userid = localStorage.getItem('userid');
  active: User[] = [];
  message: string = '';
  messages: Message[] = [];

  constructor(private sidebarService: SidebarService) {
    this.sidebarService.isSidebarHidden$.subscribe((hidden) => {
      this.isSidebarHidden = hidden;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (this.message.trim() !== '') {
        event.preventDefault();
        // Set JSON
        let messageJSON = {
          type: 'global',
          username: this.username!,
          message: this.message,
          sender: null,
          receiver: null,
        };
        this.messages.push(messageJSON);
        // Clear Textbox
        this.message = '';
        this.scrollToBottom();
      }
    }
  }

  private scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop =
        this.messageList.nativeElement.scrollHeight;
      0;
    } catch (err) {
      console.error('Scroll to bottom error:', err);
    }
  }

  isSidebarHidden: boolean = false;
  toggleSidebar() {
    this.sidebarService.toggleSideBar();
  }

  showActiveUsers: boolean = false;

  toggleActiveUsers() {
    this.showActiveUsers = !this.showActiveUsers;
  }
}
