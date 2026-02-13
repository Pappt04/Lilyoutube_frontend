import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WatchPartyService } from '../../services/watch-party.service';
import { WatchPartyWebSocketService } from '../../services/watch-party-websocket.service';
import { WatchPartyStateService } from '../../services/watch-party-state.service';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { PostService } from '../../../user/services/post.service';
import { WatchParty } from '../../../../domain/model/watch-party.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-watch-party-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VideoPlayerComponent],
  templateUrl: './watch-party-create.component.html',
  styleUrl: './watch-party-create.component.css'
})
export class WatchPartyCreateComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private watchPartyService = inject(WatchPartyService);
  private wsService = inject(WatchPartyWebSocketService);
  private postService = inject(PostService);
  private subscriptions: Subscription[] = [];

  // Public for template access
  partyState = inject(WatchPartyStateService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  publicWatchParties = signal<WatchParty[]>([]);

  // Current video being watched in the party
  currentVideoUrl = signal<string | null>(null);
  currentVideoTitle = signal<string | null>(null);

  // WebSocket connection status
  wsConnected = signal(false);

  // Use the shared state for active party
  activeParty = this.partyState.activeParty;

  createForm: FormGroup = this.fb.group({
    publicRoom: [true, [Validators.required]]
  });

  joinForm: FormGroup = this.fb.group({
    roomCode: ['', [Validators.required, Validators.minLength(6)]]
  });

  videoLinkForm: FormGroup = this.fb.group({
    videoLink: ['', [Validators.required]]
  });

  ngOnInit() {
    this.loadPublicWatchParties();
    this.setupWebSocketListener();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.activeParty()) {
      this.wsService.disconnect();
    }
  }

  /**
   * Setup WebSocket listener for video changes (works like the live chat listener)
   */
  setupWebSocketListener() {
    const msgSub = this.wsService.messages$.subscribe({
      next: (message) => {
        console.log('Received WebSocket message:', message);
        if (message.type === 'VIDEO_CHANGE' && message.videoPath) {
          console.log('Video change received, loading:', message.videoPath);
          this.loadVideoInPlayer(message.videoPath);
        }
      },
      error: (err) => {
        console.error('WebSocket message error:', err);
      }
    });
    this.subscriptions.push(msgSub);

    const connSub = this.wsService.connectionStatus$.subscribe({
      next: (connected) => {
        console.log('WebSocket connection status:', connected);
        this.wsConnected.set(connected);
      },
      error: (err) => {
        console.error('WebSocket connection error:', err);
      }
    });
    this.subscriptions.push(connSub);
  }

  /**
   * Load video in the embedded player by video path
   */
  loadVideoInPlayer(videoPath: string) {
    // Clean the path: remove extensions like .m3u8, .mp4, etc.
    let cleanPath = videoPath.replace(/\.(m3u8|mp4|webm|mkv|avi)$/i, '');

    // Construct the HLS stream URL
    const videoUrl = this.postService.getVideoUrl(cleanPath + '.m3u8');
    this.currentVideoUrl.set(videoUrl);
    this.currentVideoTitle.set(cleanPath);
    console.log('Playing video:', videoUrl);
  }

  /**
   * Extract video path from various URL formats:
   * - http://localhost:4200/videos/my-video
   * - /videos/my-video
   * - my-video
   * - my-video.m3u8
   */
  extractVideoPath(link: string): string {
    let path = link.trim();

    // If it contains /videos/, extract everything after it
    const videosIdx = path.indexOf('/videos/');
    if (videosIdx !== -1) {
      path = path.substring(videosIdx + '/videos/'.length);
    }

    // Remove query parameters and hash
    path = path.split('?')[0].split('#')[0];

    // Remove trailing slashes
    path = path.replace(/\/+$/, '');

    // Remove common video extensions
    path = path.replace(/\.(m3u8|mp4|webm|mkv|avi)$/i, '');

    return path;
  }

  /**
   * Load all public watch parties
   */
  loadPublicWatchParties() {
    this.watchPartyService.getPublicWatchParties().subscribe({
      next: (parties) => {
        this.publicWatchParties.set(parties);
      },
      error: (err) => {
        console.error('Error loading public watch parties:', err);
      }
    });
  }

  /**
   * Create a new watch party
   */
  onCreateParty() {
    if (this.createForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const publicRoom = this.createForm.value.publicRoom;

    this.watchPartyService.createWatchParty(publicRoom).subscribe({
      next: (party) => {
        this.isLoading.set(false);
        console.log('Watch party created:', party);

        // Set active party in shared state (this will also connect WebSocket)
        this.partyState.setActiveParty(party);

        // Reset video state for new party
        this.currentVideoUrl.set(null);
        this.currentVideoTitle.set(null);

        // Refresh public parties list
        this.loadPublicWatchParties();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to create watch party. Please try again.');
        console.error('Error creating watch party:', err);
      }
    });
  }

  /**
   * Join an existing watch party
   */
  onJoinParty() {
    if (this.joinForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const roomCode = this.joinForm.value.roomCode.trim().toUpperCase();

    this.watchPartyService.joinWatchParty(roomCode).subscribe({
      next: (party) => {
        this.isLoading.set(false);
        console.log('Joined watch party:', party);

        // Set active party in shared state (this will also connect WebSocket)
        this.partyState.setActiveParty(party);

        // Reset video state
        this.currentVideoUrl.set(null);
        this.currentVideoTitle.set(null);

        // Reset form
        this.joinForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to join watch party. Please check the room code.');
        console.error('Error joining watch party:', err);
      }
    });
  }

  /**
   * Join a public watch party directly
   */
  joinPublicParty(roomCode: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.watchPartyService.joinWatchParty(roomCode).subscribe({
      next: (party) => {
        this.isLoading.set(false);
        console.log('Joined public watch party:', party);

        // Set active party in shared state (this will also connect WebSocket)
        this.partyState.setActiveParty(party);

        // Reset video state
        this.currentVideoUrl.set(null);
        this.currentVideoTitle.set(null);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to join watch party.');
        console.error('Error joining watch party:', err);
      }
    });
  }

  /**
   * Leave the current watch party
   */
  leaveParty() {
    const party = this.activeParty();
    if (!party) return;

    this.isLoading.set(true);

    this.watchPartyService.leaveWatchParty(party.roomCode).subscribe({
      next: () => {
        this.isLoading.set(false);

        // Clear active party in shared state (this will also disconnect WebSocket)
        this.partyState.clearActiveParty();

        // Reset video state
        this.currentVideoUrl.set(null);
        this.currentVideoTitle.set(null);

        // Refresh public parties list
        this.loadPublicWatchParties();

        console.log('Left watch party');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to leave watch party.');
        console.error('Error leaving watch party:', err);
      }
    });
  }

  /**
   * Copy room code to clipboard
   */
  copyRoomCode(roomCode: string) {
    navigator.clipboard.writeText(roomCode).then(() => {
      console.log('Room code copied to clipboard');
      // You could show a toast notification here
    }).catch(err => {
      console.error('Failed to copy room code:', err);
    });
  }

  /**
   * Send video link to all party members via WebSocket (like sending a chat message)
   */
  sendVideoLink() {
    if (this.videoLinkForm.invalid || !this.partyState.isCreator()) {
      return;
    }

    const videoLink = this.videoLinkForm.value.videoLink.trim();
    const party = this.activeParty();

    if (!party) {
      this.error.set('No active party');
      return;
    }

    if (!this.wsService.isConnected()) {
      this.error.set('WebSocket not connected. Try leaving and rejoining the party.');
      return;
    }

    // Extract the video path from whatever URL format was pasted
    const videoPath = this.extractVideoPath(videoLink);

    if (!videoPath) {
      this.error.set('Could not extract a valid video name from the link.');
      return;
    }

    console.log('Sending video link to party:', videoPath);

    // Send via WebSocket to all other members (like chat sends messages)
    this.wsService.sendVideoChange(party.roomCode, videoPath);

    // Also load it locally for the creator
    this.loadVideoInPlayer(videoPath);

    // Clear error and input
    this.error.set(null);
    this.videoLinkForm.reset();
  }
}

