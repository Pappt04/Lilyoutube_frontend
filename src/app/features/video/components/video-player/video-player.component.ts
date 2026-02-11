import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';

@Component({
    selector: 'app-video-player',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-player.component.html',
    styleUrl: './video-player.component.css'
})
export class VideoPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() videoUrl: string = '';
    @Input() scheduledStartTime?: Date;
    @ViewChild('videoPlayer') videoElementRef!: ElementRef<HTMLVideoElement>;

    hls: Hls | null = null;
    isScheduled = false;
    timeRemaining = '';
    private timerInterval: any;

    ngOnInit() {
        this.checkScheduledStatus();
        if (this.isScheduled) {
            this.startCountdown();
        }
    }

    ngAfterViewInit() {
        if (!this.isScheduled && this.videoUrl) {
            this.initPlayer();
        }
    }

    ngOnDestroy() {
        if (this.hls) {
            this.hls.destroy();
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    private checkScheduledStatus() {
        if (this.scheduledStartTime) {
            const start = new Date(this.scheduledStartTime);
            const now = new Date();
            if (start > now) {
                this.isScheduled = true;
            } else {
                this.isScheduled = false;
            }
        } else {
            this.isScheduled = false;
        }
    }

    private startCountdown() {
        this.updateTimeRemaining();
        this.timerInterval = setInterval(() => {
            this.updateTimeRemaining();
            this.checkScheduledStatus();
            if (!this.isScheduled) {
                clearInterval(this.timerInterval);
                // Build the player when schedule ends
                setTimeout(() => this.initPlayer(), 0);
            }
        }, 1000);
    }

    private updateTimeRemaining() {
        if (!this.scheduledStartTime) return;
        const start = new Date(this.scheduledStartTime).getTime();
        const now = new Date().getTime();
        const distance = start - now;

        if (distance < 0) {
            this.timeRemaining = 'Starting soon...';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.timeRemaining = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    private initPlayer() {
        const video = this.videoElementRef.nativeElement;

        if (Hls.isSupported()) {
            this.hls = new Hls();
            this.hls.loadSource(this.videoUrl);
            this.hls.attachMedia(video);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Auto-play could be restricted by browser policies
                // video.play().catch(e => console.log('Autoplay prevented:', e));
            });
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('fatal network error encountered, try to recover');
                            this.hls?.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('fatal media error encountered, try to recover');
                            this.hls?.recoverMediaError();
                            break;
                        default:
                            // cannot recover
                            this.hls?.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = this.videoUrl;
            video.addEventListener('loadedmetadata', () => {
                // video.play();
            });
        }
    }
}
