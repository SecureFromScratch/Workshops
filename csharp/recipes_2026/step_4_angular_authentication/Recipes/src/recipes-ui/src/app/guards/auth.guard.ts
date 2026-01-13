import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    // Check if auth state has been initialized
    const currentValue = this.auth['m_me$'].value;
    
    if (currentValue === null) {
      // Auth not initialized yet, refresh from cookie
      return this.auth.refreshMe().pipe(
        take(1),
        map(me => {
          if (me !== null) {
            return true;
          }
          // Not logged in, redirect to login
          return this.router.createUrlTree(
            ['/login'],
            { queryParams: { returnUrl: state.url } }
          );
        })
      );
    }

    // Auth already initialized, use synchronous check
    if (this.auth.isLoggedIn()) {
      return true;
    }

    // redirect to login, keep where we came from
    return this.router.createUrlTree(
      ['/login'],
      { queryParams: { returnUrl: state.url } }
    );
  }
}