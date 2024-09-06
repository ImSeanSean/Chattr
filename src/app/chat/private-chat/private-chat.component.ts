import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../interfaces/user';
import { HttpClient } from '@angular/common/http';
import { mainPort } from '../../app.component';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { FormsModule, NgModel } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass, NgFor],
  templateUrl: './private-chat.component.html',
  styleUrl: './private-chat.component.css'
})
export class PrivateChatComponent implements OnInit{
  @ViewChild('messageList') private messageList!: ElementRef;

  isLoaded = false;
  username = localStorage.getItem('username');
  chatterId: string | null = "";
  chatter: User[] = [];
  message = "";
  messages: Message[] = [];

  constructor(
    private activeRoute: ActivatedRoute,
    private http: HttpClient,
    private webSocketService: WebsocketService
  ){}

  ngOnInit(): void {
      this.activeRoute.paramMap.subscribe(result => {
        //If User changes the Chatter
        this.messages = [];
        let newChatterId = result.get('userid')
        if(newChatterId != this.chatterId){
          //Update ChatterID
          this.chatterId = newChatterId;
          //Update Chatter Information
          this.http.get<User[]>(`${mainPort}/pdo/api/get_users/${this.chatterId}`).subscribe(result => {
            this.chatter = result;
            this.isLoaded = true;
            //Get Message List
            let recipientid = this.chatterId;
            let senderid = localStorage.getItem('userid');

            console.log(recipientid, senderid)

            this.http.get<Message[]>(`${mainPort}/pdo/api/get_private_message/${senderid}/${recipientid}`).subscribe(result => {
              this.messages = result;
              console.log(result)
            })
            //Subscribe to Private Messages to get updated
            this.webSocketService.getPrivateMessages().subscribe((message: Message) => {
              if (this.chatter[0].username === message.username) {
                this.messages.push(message);
                this.scrollToBottom();
              }
            });
          })
        }
      })
  }

  sendPrivateMessage(event: KeyboardEvent){
    if (event.key === 'Enter') {
      if (this.message.trim() !== '') {
        event.preventDefault();
        if (this.chatter) {
          this.webSocketService.sendPrivate(this.chatter[0].username, this.message);
          //Store Message to User
          let messageJSON = {
            type: 'private',
            senderid: localStorage.getItem('userid'),
            recipientid: this.chatterId,
            username: this.username!,
            message: this.message
          };
          this.messages.push(messageJSON)
          this.message = "";
          this.scrollToBottom();
          //Store to Database
          this.http.post(`${mainPort}/pdo/api/store_private_message`, messageJSON).subscribe(result => {
            console.log(result);
          })
        } else {
          console.error('Chatter is not loaded or does not have a username.');
        }
      }
    }
  }

  private scrollToBottom(): void {
    try {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom error:', err);
    }
  }
}
