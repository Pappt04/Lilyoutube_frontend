import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile-section',
    standalone: true,
    templateUrl: './profile-section.component.html',
    styleUrl: './profile-section.component.css'
})
export class ProfileSectionComponent {
    private router = inject(Router);
    isOpen = input<boolean>(false);
    close = output<void>();

    onClose() {
        this.close.emit();
    }

    navigateToMyChannel() {
        this.router.navigate(['/my-channel']);
        this.onClose();
    }
}
