import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-profile-section',
    standalone: true,
    templateUrl: './profile-section.component.html',
    styleUrl: './profile-section.component.css'
})
export class ProfileSectionComponent {
    isOpen = input<boolean>(false);
    close = output<void>();

    onClose() {
        this.close.emit();
    }
}
