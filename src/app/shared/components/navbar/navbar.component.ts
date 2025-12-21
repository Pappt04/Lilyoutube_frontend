import { Component, output } from '@angular/core';

@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    openProfile = output<void>();

    onProfileClick() {
        this.openProfile.emit();
    }
}
