/*import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'recipes-ui';
}

*/
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Recipes</h1>
    <button (click)="ping()">Ping</button>
    <pre>{{ result }}</pre>
  `
})
export class AppComponent {
  result = '';

  /*async ping() {
    const r = await fetch('/api/health');
    this.result = JSON.stringify(await r.json(), null, 2);
  }*/
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
}