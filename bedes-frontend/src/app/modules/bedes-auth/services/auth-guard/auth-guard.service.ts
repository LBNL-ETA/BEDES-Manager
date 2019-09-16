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
        return this.checkLogin(state.url);
    }

    private checkLogin(url: string): boolean {
        if (this.authService.isLoggedIn()) {
            return true;
        }
        else if (this.authService.needsVerify()) {
            if (!url || !url.match(/^\/home\/verify.*/)) {
                this.authService.setRedirectUrl(url);
                this.router.navigate(['/home/verify']);
                return false;
            }
            else {
                return true;
            }
        }
        else {
            this.authService.setRedirectUrl(url);
            this.router.navigate(['/home']);
            return false;
        }
    }
}
