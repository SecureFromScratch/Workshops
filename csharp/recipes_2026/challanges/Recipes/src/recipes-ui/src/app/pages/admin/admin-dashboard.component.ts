import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminDashboardResponse } from '../../services/admin.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,  // ← If you have this
    imports: [CommonModule],  // ← Add this
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    dashboardData: AdminDashboardResponse | null = null;
    loading = true;
    error: string | null = null;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadDashboard();
    }

    loadDashboard(): void {
        this.adminService.getDashboard().subscribe({
            next: (data) => {
                console.log('✅ Data received:', data);
                this.dashboardData = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('❌ Error:', err);
                this.error = 'Failed to load dashboard';
                this.loading = false;
            }
        });
    }
}