
# Client

## Create the Angular app

From repo root (not inside `src` is fine, but I recommend `src`):

```bash
cd ..
cd src
ng new recipes-ui --routing --style=scss
```
Answer No to the following question:
```
✔ Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? No
```

---

## Make Angular call the BFF (dev proxy)

Create `src/recipes-ui/proxy.conf.json`:

```json
{
  "/api": {
    "target": "https://localhost:7001",
    "secure": false,
    "changeOrigin": true
  }
}
```

> Update `7001` to your **BFF** HTTPS port.

Update `src/recipes-ui/package.json` scripts:

```json
"start": "ng serve --proxy-config proxy.conf.json"
```

Run Angular:

```bash
cd recipes-ui
npm start
```

Now in Angular, your frontend can call `/api/health` and it goes:
Angular -> BFF -> API.

---

## Create Quick UI smoke test

In `src/recipes-ui/src/app/app.component.ts`:

```ts
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

  async ping() {
    const r = await fetch('/api/health');
    this.result = JSON.stringify(await r.json(), null, 2);
  }
}
```
---
## Create Quick UI smoke test
```
ng serve 
```
Click the ping button and watch the response in the developers tools network tab.
You can also put breakpoint in the health endpoint both in the bff and the api services.
