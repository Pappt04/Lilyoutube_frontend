import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { MyChannelComponent } from './features/user/my-channel/my-channel.component';
import { NewVideoComponent } from './features/user/new-video/new-video.component';
import { VideoPageComponent } from './features/video/components/video-page/video-page.component';
import { ProfileComponent } from './features/user/components/profile/profile.component';
import { LoginComponent } from './features/user/pages/login/login.component';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // public
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'videos/:id', component: VideoPageComponent },
  { path: 'users/:id', component: ProfileComponent },

  // auth pages (public)
  { path: 'user/login', component: LoginComponent },
  {
    path: 'user/register',
    loadComponent: () =>
      import('./features/user/pages/register/register.component')
        .then(m => m.RegisterComponent)
  },
  {
    path: 'user/activate',
    loadComponent: () =>
      import('./features/user/pages/activate/activate.component')
        .then(m => m.ActivateComponent)
  },

  // protected (ulogovani)
  { path: 'my-channel', component: MyChannelComponent, canActivate: [authGuard] },
  { path: 'my-channel/new-video', component: NewVideoComponent, canActivate: [authGuard] },

  // fallback
  { path: '**', redirectTo: 'home' }
];
