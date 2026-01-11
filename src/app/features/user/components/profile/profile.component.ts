import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../../../domain/model/user.model';
import { Observable, switchMap, catchError, of } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="profile-container">
            @if (user$ | async; as user) {
                <div class="profile-header">
                    <div class="profile-avatar"></div>
                    <div class="profile-info">
                        <h1>{{ user.username }}</h1>
                        <p class="profile-email">{{ user.email }}</p>
                    </div>
                </div>
                <div class="profile-content">
                    <p>User Profile</p>
                </div>
            } @else if (errorMessage) {
                <div class="error-message">{{ errorMessage }}</div>
            } @else {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            }
        </div>
    `,
    styles: [`
        .profile-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .profile-header {
            display: flex;
            gap: 20px;
            align-items: center;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 12px;
            margin-bottom: 20px;
        }

        .profile-avatar {
            width: 80px;
            height: 80px;
            background: #ccc;
            border-radius: 50%;
        }

        .profile-info h1 {
            margin: 0 0 8px 0;
            font-size: 24px;
        }

        .profile-email {
            color: #606060;
            margin: 0;
        }

        .profile-content {
            padding: 20px;
        }

        .error-message {
            background: #fee;
            color: #c33;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
        }

        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0f0f0f;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `]
})
export class ProfileComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private userService = inject(UserService);

    user$!: Observable<User | null>;
    errorMessage: string | null = null;

    ngOnInit() {
        this.user$ = this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (!id) {
                    this.router.navigate(['/home']);
                    return of(null);
                }
                return this.userService.getUserById(Number(id)).pipe(
                    catchError(error => {
                        this.errorMessage = 'User not found';
                        return of(null);
                    })
                );
            })
        );
    }
}
