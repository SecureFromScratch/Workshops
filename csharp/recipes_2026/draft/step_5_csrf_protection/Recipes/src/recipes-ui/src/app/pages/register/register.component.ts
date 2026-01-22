import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Add this!
})
export class RegisterComponent implements OnInit {

  userName = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.auth.isFirstUser().subscribe(isFirst => {
      if (isFirst) {
        this.router.navigate(['/setup']);
      }
    });
  }

  onSubmit(): void {
    this.error = '';
    this.auth.register(this.userName, this.password).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { registered: 'true' } }),
      error: err => {
        this.error = err.error?.error ?? 'Registration failed';
      }
    });
  }
}