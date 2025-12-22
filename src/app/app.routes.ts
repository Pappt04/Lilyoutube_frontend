import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MyChannelComponent } from './features/user/my-channel/my-channel.component';
import { NewVideoComponent } from './features/user/new-video/new-video.component';
import { VideoPageComponent } from './features/video/components/video-page/video-page.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'my-channel', component: MyChannelComponent },
    { path: 'my-channel/new-video', component: NewVideoComponent },
    { path: 'videos/:id', component: VideoPageComponent },
];
