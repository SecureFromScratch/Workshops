import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardResponse {
    message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
    constructor(private http: HttpClient) { }

    getDashboard(): Observable<AdminDashboardResponse> {
        return this.http.get<AdminDashboardResponse>('/api/admin/dashboard', { withCredentials: true });
    }
}