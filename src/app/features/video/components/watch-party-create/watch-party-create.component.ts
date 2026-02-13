import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WatchPartyService } from '../../services/watch-party.service';
import { WatchPartyWebSocketService } from '../../services/watch-party-websocket.service';
import { WatchPartyStateService } from '../../services/watch-party-state.service';
import { WatchParty } from '../../../../domain/model/watch-party.model';

@Component({
  selector: 'app-watch-party-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './watch-party-create.component.html',
  styleUrl: './watch-party-create.component.css'
})
export class WatchPartyCreateComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private watchPartyService = inject(WatchPartyService);
  private wsService = inject(WatchPartyWebSocketService);
  private partyState = inject(WatchPartyStateService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  publicWatchParties = signal<WatchParty[]>([]);

  // Use the shared state for active party
  activeParty = this.partyState.activeParty;

  createForm: FormGroup = this.fb.group({
    publicRoom: [true, [Validators.required]]
  });

  joinForm: FormGroup = this.fb.group({
    roomCode: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    this.loadPublicWatchParties();
    this.setupWebSocketListener();
  }

  ngOnDestroy() {
    // Disconnect WebSocket when component is destroyed
    if (this.activeParty()) {
      this.wsService.disconnect();
    }
  }

  /**
   * Setup WebSocket listener for video changes
   */
  setupWebSocketListener() {
    this.wsService.messages$.subscribe({
      next: (message) => {
        if (message.type === 'VIDEO_CHANGE') {
          console.log('Received video change notification:', message);

          // Navigate to the video page that the party creator selected
          // This will automatically open the video for all party members
          this.router.navigate(['/videos', message.videoPath]);
        }
      },
      error: (err) => {
        console.error('WebSocket message error:', err);
      }
    });

    this.wsService.connectionStatus$.subscribe({
      next: (connected) => {
        console.log('WebSocket connection status:', connected);
      },
      error: (err) => {
        console.error('WebSocket connection error:', err);
      }
    });
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
}
