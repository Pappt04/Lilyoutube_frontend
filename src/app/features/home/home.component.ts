import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../user/services/post.service';
import { Observable } from 'rxjs';
import { VideoPost } from '../../domain/model/video-post.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    private postService = inject(PostService);
    private router = inject(Router);
    videos$!: Observable<VideoPost[]>;

    ngOnInit() {
        this.videos$ = this.postService.getVideos();
    }

    navigateToVideo(videoPath: string) {
      let parts= videoPath.split('.');
      if (parts.length > 1) {
        videoPath = parts[0];
      }
      this.router.navigate(['/videos', videoPath]);
    }

    getThumbnailUrl(filename: string): string | null {
        if (!filename) return null;
        return this.postService.getThumbnailUrl(filename);
    }
}
