# Angular BFF Pattern Tutorial

The BFF server acts as a proxy that:
- Manages authentication cookies
- Handles session state
- Forwards authenticated requests to your backend API

## Key Components

### 1. Auth Service (`auth.service.ts`)

The auth service manages authentication state on the client side.

**Key Patterns:**

#### BehaviorSubject for State Management
```typescript
private m_me$ = new BehaviorSubject<MeResponse | null>(null);
me$ = this.m_me$.asObservable();
```

- `m_me$` is **private** - only the service can update auth state
- `me$` is **public** - components can subscribe to auth changes
- Initialized with `null` (unknown state)

#### Cookie-Based Requests
```typescript
login(userName: string, password: string): Observable<MeResponse> {
  return this.http.post<MeResponse>(
    `${this.baseUrl}/login`,
    { userName, password },
    { withCredentials: true }  // ← Critical: sends/receives cookies
  ).pipe(
    tap(me => this.m_me$.next(me))  // ← Update state on success
  );
}
```

**Important:** `withCredentials: true` must be on **every** request that needs authentication.

#### State Rehydration
```typescript
refreshMe(): Observable<MeResponse | null> {
  return this.http.get<MeResponse>(
    `${this.baseUrl}/me`,
    { withCredentials: true }
  ).pipe(
    tap(me => this.m_me$.next(me)),
    catchError(() => {
      this.m_me$.next(null);  // ← Clear state on error
      return of(null);
    })
  );
}
```

This fetches the current user from the server's cookie session.

### 2. Auth Guard (`auth.guard.ts`)

Protects routes from unauthorized access.

**Key Logic:**

```typescript
canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | boolean | UrlTree {
  const currentValue = this.auth['m_me$'].value;
  
  if (currentValue === null) {
    // First access - need to check cookie
    return this.auth.refreshMe().pipe(
      take(1),
      map(me => {
        if (me !== null) return true;
        
        // Redirect to login with return URL
        return this.router.createUrlTree(
          ['/login'],
          { queryParams: { returnUrl: state.url } }
        );
      })
    );
  }

  // Already initialized
  if (this.auth.isLoggedIn()) {
    return true;
  }

  return this.router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
}
```

**Why check `currentValue === null`?**
- On app startup, we don't know if the user has a valid cookie
- We call `refreshMe()` to check the server
- Subsequent navigations use the cached state (faster)

### 3. App Initialization (`app.component.ts`)

```typescript
ngOnInit(): void {
  this.auth.refreshMe().subscribe();
}
```

**Critical:** This runs on app startup to:
1. Check if there's a valid cookie on the server
2. Populate the auth state
3. Enable the AuthGuard to work synchronously on subsequent navigations

### 4. Login Component

**Handling Success:**
```typescript
onSubmit(): void {
  this.auth.login(this.userName, this.password).subscribe({
    next: (me: MeResponse) => {
      this.router.navigate(['/home']);  // ← Redirect after login
    },
    error: err => {
      this.error = err.error?.error ?? 'Login failed';
    }
  });
}
```



This allows other pages to redirect to login with a message.

## Complete Flow Example

### Initial Page Load
1. User visits `/home` (protected route)
2. `AuthGuard.canActivate()` runs
3. `currentValue === null` (not initialized)
4. `refreshMe()` calls `/bff/account/me`
5. Server checks cookie, returns user data or 401
6. If valid: allow access; if not: redirect to `/login?returnUrl=/home`

### Login Flow
1. User submits credentials
2. `login()` calls `/bff/account/login`
3. Server sets HTTP-only cookie in response
4. Service updates `m_me$` with user data
5. Component redirects to `/home`
6. All future requests automatically include cookie

### Logout Flow
```typescript
logout(): Observable<void> {
  return this.http.post<void>(
    `${this.baseUrl}/logout`,
    {},
    { withCredentials: true }
  ).pipe(
    tap(() => this.m_me$.next(null)),  // ← Clear client state
    catchError(() => {
      this.m_me$.next(null);  // ← Clear even on error
      return of(void 0);
    })
  );
}
```

## Common Patterns

### Protecting Routes
```typescript
// app.routes.ts
{
  path: 'home',
  component: HomeComponent,
  canActivate: [AuthGuard]  // ← Add guard
}
```

### Displaying User Info
```typescript
// any.component.ts
me$ = this.auth.me$;

// any.component.html
<div *ngIf="me$ | async as user">
  Welcome, {{ user.userName }}!
</div>
```

### Role-Based Access
```typescript
// Extend AuthGuard
canActivate(route: ActivatedRouteSnapshot) {
  const requiredRole = route.data['role'];
  const user = this.auth['m_me$'].value;
  
  if (user && user.roles.includes(requiredRole)) {
    return true;
  }
  return this.router.createUrlTree(['/unauthorized']);
}
```

---

The following files have been changed to support lgoin, registration and so on.
If you struggle, you can copy them from the repo. 
        
app/app.component.html

app/app.component.ts

app/app.config.ts

app/app.routes.ts

app/guards/auth.guard.ts

app/interceptors/credentials.interceptor.ts

app/pages/home/home.component.css

app/pages/home/home.component.html

app/pages/home/home.component.ts

app/pages/login/login.component.html

app/pages/login/login.component.ts

app/pages/register/register.component.html

app/pages/register/register.component.ts

app/pages/setup/setup.component.html

app/pages/setup/setup.component.ts

app/services/auth.service.ts


        