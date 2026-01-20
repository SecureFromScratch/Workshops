import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLinkActive, RouterOutlet, RouterLink, Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { firstValueFrom } from "rxjs";



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLinkActive, RouterLink
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'client';

  result = '';

  async ping() {
    const r = await fetch('/health');
    console.log('Status:', r.status);
    console.log('Content-Type:', r.headers.get('content-type'));
    const text = await r.text();
    console.log('Raw response:', text);

    try {
      this.result = JSON.stringify(JSON.parse(text), null, 2);
    } catch (e) {
      this.result = text; // Show raw text if not JSON
    }
  }

  constructor(private auth: AuthService,  private router: Router) { }

  ngOnInit(): void {
    this.auth.refreshMe().subscribe();
  }

  onLogout(event: Event): void {
    event.preventDefault(); // Prevent default link behavior

    this.auth.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
        // Still redirect even if logout fails
        this.router.navigate(['/login']);
      }
    });
  }
}


