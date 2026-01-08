import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const apiProxyInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const backendUrl = 'http://localhost:8080/api';

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (req.url.startsWith(backendUrl)) {
    const newUrl = req.url.replace(backendUrl, '/api');
    console.log(`Proxying request from ${req.url} to ${newUrl}`);
    return next(req.clone({ url: newUrl }));
  }

  return next(req);
};
