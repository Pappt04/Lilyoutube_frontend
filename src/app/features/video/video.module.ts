import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoRoutingModule } from './video-routing.module';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

@NgModule({
    declarations: [
        VideoPlayerComponent
    ],
    imports: [
        CommonModule,
        VideoRoutingModule
    ]
})
export class VideoModule { }
