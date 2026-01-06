import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest } from './auth.models';
import { User } from '../../domain/model/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly api = environment.apiUrl;
  private readonly tokenKey = 'auth_token';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  currentUser = signal<User | null>(null);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(payload: RegisterRequest): Observable<string> {
    return this.http.post(`${this.api}/auth/register`, payload, { responseType: 'text' });
  }

  activate(token: string): Observable<string> {
    return this.http.get(`${this.api}/auth/activate`, {
      params: { token },
      responseType: 'text'
    });
  }

  login(payload: LoginRequest): Observable<string> {
    return this.http
      .post(`${this.api}/auth/login`, payload, { responseType: 'text' as const })
      .pipe(
        tap(token => this.setToken((token ?? '').trim())),
        tap(() => this.refreshUser().subscribe())
      );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.api}/users/me`);
  }

  refreshUser(): Observable<User> {
    return this.getMe().pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.currentUser.set(user);
      })
    );
  }

  logout(): void {
    if (!this.isBrowser) return;
    window.localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return window.localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string) {
    if (!this.isBrowser) return;
    if (!token) return;
    window.localStorage.setItem(this.tokenKey, token);
  }
}
