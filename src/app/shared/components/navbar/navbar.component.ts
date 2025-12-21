import { Component, output } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [
    NgOptimizedImage
  ],
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    openProfile = output<void>();

    onProfileClick() {
        this.openProfile.emit();
    }

}
