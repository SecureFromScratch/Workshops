// csrf.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';


export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const token = auth.getCsrfToken();

    if (!token || !req.url.startsWith('/bff')) {
        return next(req);
    }

    const cloned = req.clone({
        setHeaders: {
            'X-CSRF-TOKEN': token
        },
        withCredentials: true
    });

    return next(cloned);
};
