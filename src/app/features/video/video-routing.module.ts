import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoPageComponent } from './components/video-page/video-page.component';

const routes: Routes = [
    { path: ':id', component: VideoPageComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VideoRoutingModule { }
