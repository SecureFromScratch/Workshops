import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, map, of, tap } from 'rxjs';

export interface MeResponse {
  userName: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: MeResponse;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly bffRoot = '/bff';
  private readonly baseUrl = `${this.bffRoot}/account`;
  private requestToken: string | null = null;


  // Source of truth in the client: "me" returned from server (cookie-backed)
  private m_me$ = new BehaviorSubject<MeResponse | null>(null);
  me$ = this.m_me$.asObservable();

  constructor(private http: HttpClient) { }

  isFirstUser(): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/is-first-user`, { withCredentials: true });
  }

  setup(userName: string, password: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/setup`,
      { userName, password },
      { withCredentials: true }
    );
  }

  register(userName: string, password: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/register`,
      { userName, password },
      { withCredentials: true }
    );
  }




  login(userName: string, password: string): Observable<MeResponse> {
    return this.http.post<MeResponse>(
      `${this.baseUrl}/login`,
      { userName, password },
      { withCredentials: true }
    ).pipe(
      tap(me => this.m_me$.next(me))
    );
  }

  // Clear cookie on server + clear in-memory state
  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.m_me$.next(null)),
      catchError(() => {
        // even if the request fails, don't pretend user is still logged in
        this.m_me$.next(null);
        return of(void 0);
      })
    );
  }

  // Used by AuthGuard
  isLoggedIn(): boolean {
    return this.m_me$.value !== null;
  }

  // Call this once on app startup to rehydrate auth from the cookie
  refreshMe(): Observable<MeResponse | null> {
    return this.http.get<MeResponse>(
      `${this.baseUrl}/me`,
      { withCredentials: true }
    ).pipe(
      tap(me => this.m_me$.next(me)),
      map(me => me ?? null),
      catchError(() => {
        this.m_me$.next(null);
        return of(null);
      })
    );
  }
  initCsrf(): Observable<void> {
    return this.http
      .get<{ token: string }>(`${this.baseUrl}/antiforgery`, {
        withCredentials: true
      })
      .pipe(
        tap(response => {
          this.requestToken = response.token;
          console.log('CSRF request token stored:', this.requestToken);
        }),
        map(() => { })
      );
  }

  getRequestToken(): string | null {
    return this.requestToken;
  }

  // Keep your old me() name too, but make it cookie-based and update state
  me(): Observable<MeResponse | null> {
    return this.refreshMe();
  }
}
