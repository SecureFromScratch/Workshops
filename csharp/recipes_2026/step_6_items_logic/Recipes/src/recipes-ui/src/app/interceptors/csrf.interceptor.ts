// csrf.interceptor.ts
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    
    // Only for mutating requests to BFF
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) || !req.url.includes('/bff')) {
        return next(req);
    }
    
    const token = authService.getRequestToken();
    
    if (!token) {
        console.warn('No CSRF request token available');
        return next(req);
    }
    
    const cloned = req.clone({
        setHeaders: {
            'X-XSRF-TOKEN': token
        },
        withCredentials: true
    });
    
    return next(cloned);
};