import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../user/services/post.service';
import { Observable } from 'rxjs';
import { VideoPost } from '../../domain/model/video-post.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    private postService = inject(PostService);
    videos$!: Observable<VideoPost[]>;

    ngOnInit() {
        this.videos$ = this.postService.getVideos();
    }

    getThumbnailUrl(filename: string): string | null {
        if (!filename) return null;
        return this.postService.getThumbnailUrl(filename);
    }
}
