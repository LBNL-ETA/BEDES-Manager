import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        console.log('AuthGuard check...', state.url);
        return this.checkLogin(state.url);
    }

    private checkLogin(url: string): boolean {
        if (this.authService.isLoggedIn()) {
            console.log(`${ this.constructor.name }: user is logged in`);
            return true;
        }
        else if (this.authService.needsVerify()) {
            console.log(`${ this.constructor.name }: user needs activation`);
            console.log(url);
            if (!url || !url.match(/^\/home\/verify/)) {
                console.log('redirect...', url);
                this.authService.redirectUrl = url;
                this.router.navigate(['/home/verify']);
                return false;
            }
            else {
                console.log('user needs redirect, but headed there anyways')
                return true;
            }
        }
        else {
            console.warn(`${ this.constructor.name }: user not logged in, redirecting`);
            this.authService.redirectUrl = url;
            this.router.navigate(['/home']);
            return false;
        }
    }
}
