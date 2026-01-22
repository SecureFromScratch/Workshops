import { HttpInterceptorFn } from "@angular/common/http";

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Add withCredentials to all BFF requests
  if (req.url.includes('/bff/')) {
    const cloned = req.clone({ withCredentials: true });
    return next(cloned);
  }
  return next(req);
};