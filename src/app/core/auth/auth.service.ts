import { Injectable, signal } from '@angular/core';
import { User } from '../../domain/model/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUser = signal<User | null>(null);
    public currentUser$ = this.currentUser.asReadonly();

    constructor() {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                this.currentUser.set(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('currentUser');
            }
        }
    }

    isAuthenticated(): boolean {
        return this.currentUser() !== null;
    }

    getCurrentUser(): User | null {
        return this.currentUser();
    }

    getCurrentUserId(): number | null {
        const user = this.currentUser();
        return user ? Number(user.id) : null;
    }

    login(user: User) {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem('currentUser');
    }
}
