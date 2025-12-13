import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    console.log('Intercepting request', req.url);
    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer my-token`
        }
    });
    return next(authReq);
};
