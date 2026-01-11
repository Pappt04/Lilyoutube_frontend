import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoRoutingModule } from './video-routing.module';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoPageComponent } from './components/video-page/video-page.component';

@NgModule({
    declarations: [
        VideoPlayerComponent
    ],
  imports: [
    CommonModule,
    VideoRoutingModule,
    VideoPageComponent
  ]
})
export class VideoModule { }
