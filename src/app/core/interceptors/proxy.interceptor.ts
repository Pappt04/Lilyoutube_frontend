import { HttpInterceptorFn } from '@angular/common/http';

export const apiProxyInterceptor: HttpInterceptorFn = (req, next) => {
    const backendUrl = 'http://localhost:8080/api';

    if (req.url.startsWith(backendUrl)) {
        const newUrl = req.url.replace(backendUrl, '/api');
        const clonedReq = req.clone({
            url: newUrl
        });
        console.log(`Proxying request from ${req.url} to ${newUrl}`);
        return next(clonedReq);
    }

    return next(req);
};
