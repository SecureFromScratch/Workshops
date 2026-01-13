import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add this!
})
export class SetupComponent implements OnInit {

  userName = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.auth.isFirstUser().subscribe(isFirst => {
      if (!isFirst) {
        this.router.navigate(['/register']);
      }
    });
  }

  onSubmit(): void {
    this.error = '';
    this.auth.setup(this.userName, this.password).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { setup: 'success' } }),
      error: err => {
        this.error = err.error?.error ?? 'Setup failed';
      }
    });
  }
}