import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MyChannelComponent } from './features/user/my-channel/my-channel.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'my-channel', component: MyChannelComponent }
];
