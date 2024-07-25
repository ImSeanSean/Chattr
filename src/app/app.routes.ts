import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing/landing-page/landing-page.component';
import { ChatLayoutComponent } from './chat/chat-layout/chat-layout.component';
import { TheChatterComponent } from './chat/the-chatter/the-chatter.component';

export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'chats', component: ChatLayoutComponent,
        children: [
            {path: 'the-chatter', component: TheChatterComponent}
        ]
    }
];
