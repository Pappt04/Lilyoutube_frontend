import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor() { }

    login() {
        console.log('Login logic here');
    }

    logout() {
        console.log('Logout logic here');
    }
}
