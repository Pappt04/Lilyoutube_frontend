import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Hls from 'hls.js';

@Component({
    selector: 'app-video-player',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-player.component.html',
    styleUrl: './video-player.component.css'
})
export class VideoPlayerComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @Input() videoUrl: string = '';
    @Input() scheduledStartTime?: Date;
    @Output() play = new EventEmitter<void>();
    @ViewChild('videoPlayer') videoElementRef!: ElementRef<HTMLVideoElement>;

    hls: Hls | null = null;
    isScheduled = false;
    timeRemaining = '';
    private timerInterval: any;
    private playEventEmitted = false;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

    ngOnInit() {
        this.checkScheduledStatus();
        if (this.isScheduled) {
            this.startCountdown();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['videoUrl'] && !changes['videoUrl'].firstChange && isPlatformBrowser(this.platformId)) {
            // Video URL changed - reinitialize the player with the new source
            if (this.hls) {
                this.hls.destroy();
                this.hls = null;
            }
            this.playEventEmitted = false;
            if (this.videoUrl && this.videoElementRef) {
                this.initPlayer();
            }
        }
    }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId) && !this.isScheduled && this.videoUrl) {
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
            this.isScheduled = start > now;
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
                setTimeout(() => this.initPlayer(), 300);
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
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        if (!this.videoElementRef || !this.videoElementRef.nativeElement) {
            console.warn('Video element not available yet, retrying...');
            setTimeout(() => this.initPlayer(), 100);
            return;
        }

        const video = this.videoElementRef.nativeElement;

        // Add play event listener to emit play event
        video.addEventListener('play', () => {
            if (!this.playEventEmitted) {
                this.playEventEmitted = true;
                this.play.emit();
                console.log('Video play event emitted');
            }
        });

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
