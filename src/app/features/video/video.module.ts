import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoRoutingModule } from './video-routing.module';

import { VideoPageComponent } from './components/video-page/video-page.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    VideoRoutingModule,
    VideoPageComponent
  ]
})
export class VideoModule { }
