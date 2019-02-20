import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UserStatus } from '@bedes-common/enums/user-status.enum';

@Injectable()
export class InterceptorService implements HttpInterceptor {
    constructor(
        private authService: AuthService
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('**http intercepted', req);
        // return next.handle(req);
        return next
            .handle(req)
            .pipe(tap(event => {
                if (event instanceof HttpResponse) {
                    if (event.status === 401) {
                        this.authService.setUnauthorizedUser();
                    }
                }
            }, (error: any) => {
                console.log('**http interceptor error');
                console.log(error);
            }));
    }
}
