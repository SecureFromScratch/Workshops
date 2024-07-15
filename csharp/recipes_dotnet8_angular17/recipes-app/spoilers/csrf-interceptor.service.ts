import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the CSRF token from a cookie
    const csrfToken = this.getCookie('X-XSRF-TOKEN');

    if (csrfToken) {
      // Clone the request to add the CSRF token to the header
      const csrfReq = req.clone({
        headers: req.headers.set('X-XSRF-TOKEN', csrfToken),
        withCredentials: true
      });
      return next.handle(csrfReq);
    }

    return next.handle(req);
  }

  // Utility function to get a cookie by name
  private getCookie(name: string): string | null {
    const matches = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return matches ? matches[2] : null;
  }
}
