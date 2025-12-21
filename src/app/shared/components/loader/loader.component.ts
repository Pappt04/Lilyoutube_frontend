import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    template: '<div class="loader">Loading...</div>',
    styleUrl: './loader.component.css'
})
export class LoaderComponent { }
