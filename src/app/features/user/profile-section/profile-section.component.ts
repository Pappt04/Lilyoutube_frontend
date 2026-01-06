import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-profile-section',
    standalone: true,
    templateUrl: './profile-section.component.html',
    styleUrl: './profile-section.component.css'
})
export class ProfileSectionComponent {
    private router = inject(Router);
    private auth = inject(AuthService);

    user = this.auth.currentUser;
    isOpen = input<boolean>(false);
    close = output<void>();

    onClose() {
        this.close.emit();
    }

    navigateToMyChannel() {
        this.router.navigate(['/user/my-channel']);
        this.onClose();
    }

    onLogout() {
        this.auth.logout();
        this.router.navigate(['/']);
        this.onClose();
    }
}
