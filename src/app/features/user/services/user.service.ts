import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../../../domain/model/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    getUserById(id: number | string): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/users/${id}`);
    }
}
