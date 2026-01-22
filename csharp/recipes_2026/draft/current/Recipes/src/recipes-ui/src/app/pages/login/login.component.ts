import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, MeResponse } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
})
export class LoginComponent {

  userName = '';
  password = '';
  error = '';
  info = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    route: ActivatedRoute
  ) {
    const setup = route.snapshot.queryParamMap.get('setup');
    const registered = route.snapshot.queryParamMap.get('registered');
    if (setup === 'success') {
      this.info = 'Admin setup completed. Please log in.';
    } else if (registered === 'true') {
      this.info = 'Registration successful. Please log in.';
    }
  }

  onSubmit(): void {
    this.error = '';
    this.info = '';
    this.auth.login(this.userName, this.password).subscribe({
      next: (me: MeResponse) => {
        this.router.navigate(['recipes']);
      },
      error: err => {
        this.error = err.error?.error ?? 'Login failed';
      }
    });
  }
}