import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  WatchParty,
  CreateWatchPartyRequest,
  JoinWatchPartyRequest
} from '../../../domain/model/watch-party.model';

@Injectable({
  providedIn: 'root'
})
export class WatchPartyService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/watchparty`;

  /**
   * Create a new watch party
   */
  createWatchParty(publicRoom: boolean): Observable<WatchParty> {
    const request: CreateWatchPartyRequest = { publicRoom };
    return this.http.post<WatchParty>(`${this.baseUrl}/create`, request);
  }

  /**
   * Join an existing watch party by room code
   */
  joinWatchParty(roomCode: string): Observable<WatchParty> {
    const request: JoinWatchPartyRequest = { roomCode };
    return this.http.post<WatchParty>(`${this.baseUrl}/join`, request);
  }

  /**
   * Leave a watch party
   */
  leaveWatchParty(roomCode: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${roomCode}/leave`, {});
  }

  /**
   * Update the current video in a watch party
   */
  updateCurrentVideo(roomCode: string, videoId: number): Observable<WatchParty> {
    return this.http.put<WatchParty>(`${this.baseUrl}/${roomCode}/video/${videoId}`, {});
  }

  /**
   * Get watch party details by room code
   */
  getWatchParty(roomCode: string): Observable<WatchParty> {
    return this.http.get<WatchParty>(`${this.baseUrl}/${roomCode}`);
  }

  /**
   * Get all public watch parties
   */
  getPublicWatchParties(): Observable<WatchParty[]> {
    return this.http.get<WatchParty[]>(`${this.baseUrl}/public`);
  }
}
