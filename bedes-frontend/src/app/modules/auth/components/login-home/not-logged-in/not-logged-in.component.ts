import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog} from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { AuthService } from '../../../services/auth/auth.service';
import { UserLogin } from '../../../models/auth/user-login';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { CurrentUser } from '../../../../../../../../bedes-common/models/current-user/current-user';

@Component({
  selector: 'app-not-logged-in',
  templateUrl: './not-logged-in.component.html',
  styleUrls: ['./not-logged-in.component.scss']
})
export class NotLoggedInComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public waiting = false;
    public userLogin: UserLogin;
    public loginSuccess = false;
    public loginError = false;
    public loginErrorMessage: string;
    public isEditable = false;
    public isloggedIn = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog
    ) { }

    /**
     * Initialize the component.
     *
     * @memberof LoginComponent
     */
    ngOnInit() {
        // create a new UserLogin object
        this.userLogin = new UserLogin();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Attempts to authenticate the user with the given credentials.
     *
     * @memberof LoginComponent
     */
    public login(): void {
        this.resetLoginError();
        this.waiting = true;
        console.log('calling authservice loing...', this.userLogin);
        this.authService.login(this.userLogin).subscribe(
            (currentUser: CurrentUser) => {
                console.log(`${this.constructor.name}: received response`, currentUser);
                this.loginSuccess = currentUser.needsVerify();
                // navigate to home after 1 second
                if (currentUser.needsVerify()) {
                    if (this.authService.needsRedirect() && this.authService.redirectUrl.match(/^\/home\/verify/)) {
                        // going to verification so redirect
                        console.log('reciredt to ', this.authService.redirectUrl);
                        // this.router.navigate([this.authService.redirectUrl]);
                        setTimeout(() => this.router.navigateByUrl(this.authService.redirectUrl), 1000);
                    }
                    else {
                        console.log('no redirect');
                        setTimeout(() => this.router.navigateByUrl('/home/verify'), 1000);
                    }
                }
                else if (currentUser.isGuest()) {
                    if (this.authService.needsRedirect()) {
                        setTimeout(() => this.router.navigateByUrl(this.authService.redirectUrl), 1000);
                    }
                    else {
                        setTimeout(() => this.router.navigateByUrl('/home'), 1000);
                    }
                }
            },
            (err: any) => {
                // login was denied (401) or some other error
                console.log(`${this.constructor.name}: Error received response`, err);
                this.loginError = true;
                if (err.status === 401) {
                    this.loginErrorMessage = 'Invalid credentials';
                } else {
                    this.loginErrorMessage = 'An unknown error occurred, unable to log in';
                }
            }
        );
    }

    /**
     * Reset the login error flag and message string.
     *
     * @private
     * @memberof LoginComponent
     */
    private resetLoginError(): void {
        this.loginError = false;
        this.loginErrorMessage = null;
    }

    /**
     * Reset's the user password with the given email address.
     *
     * @memberof LoginComponent
     */
    public forgotPassword(): void {
        // TODO: write this
    }

    /**
     * User wishes to create a new account, redirect to the
     * account creation page.
     *
     * @memberof LoginComponent
     */
    public accountRequest(): void {
        // TODO: write this
        // const dialogRef = this.dialog.open(UserInfoComponent, {
        //     panelClass: 'dialog-no-padding',
        //     data: {}
        // });
    }
}
