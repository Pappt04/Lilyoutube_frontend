import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VideoService {
    constructor() { }

    getVideo(id: string) {
        return { id, title: 'Sample Video' };
    }
}
