import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing/landing-page/landing-page.component';
import { ChatLayoutComponent } from './chat/chat-layout/chat-layout.component';
import { TheChatterComponent } from './chat/the-chatter/the-chatter.component';
import { PrivateChatComponent } from './chat/private-chat/private-chat.component';
import { authenticationGuard } from './guard/authentication.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'chats',
    component: ChatLayoutComponent,
    canActivate: [authenticationGuard],
    children: [
      { path: 'the-chatter', component: TheChatterComponent },
      { path: 'p/:userid', component: PrivateChatComponent },
    ],
  },
];
