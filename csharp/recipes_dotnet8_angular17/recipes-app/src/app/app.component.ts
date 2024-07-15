import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'recipes-app';
  constructor(private cookieService: CookieService) {
    this.createCookie();
  }


  createCookie() {
    // Create a cookie named 'user' with a value and an expiration time
    this.cookieService.set('user', 'JohnDoe', 7,undefined,undefined,true,'Lax'); 
  }
}
