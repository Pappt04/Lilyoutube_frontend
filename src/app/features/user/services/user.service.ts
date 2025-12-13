import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor() { }

    getUserProfile() {
        return { name: 'John Doe', email: 'john@example.com' };
    }
}
