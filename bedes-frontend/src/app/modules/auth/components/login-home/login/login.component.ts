import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog} from '@angular/material';

import { AuthService } from '../../../services/auth/auth.service';
import { UserLogin } from '../../../models/auth/user-login';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { IUserStatus } from '@bedes-common/interfaces/user-status';
// import { UserInfoComponent } from '../../../epb-account/components/user-info/user-info.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    public waiting = false;
    public userLogin: UserLogin;
    public loginSuccess = false;
    public loginError = false;
    public loginErrorMessage: string;

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
        console.log(`${this.constructor.name}: created new userLogin object`, this.userLogin);
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
            (newUserStatus: IUserStatus) => {
                console.log(`${this.constructor.name}: received response`, newUserStatus);
                this.loginSuccess = (newUserStatus.status === UserStatus.NeedsVerify ? true : false);
                // navigate to home after 1 second
                if (newUserStatus.status === UserStatus.NeedsVerify) {
                    if (this.authService.needsRedirect() && this.authService.redirectUrl.match(/^\/login\/verify/)) {
                        // going to verification so redirect
                        console.log('reciredt to ', this.authService.redirectUrl);
                        // this.router.navigate([this.authService.redirectUrl]);
                        setTimeout(() => this.router.navigateByUrl(this.authService.redirectUrl), 1000);
                    }
                    else {
                        console.log('no redirect');
                        setTimeout(() => this.router.navigateByUrl('/login/verify'), 1000);
                    }
                }
                else if (newUserStatus.status === UserStatus.IsLoggedIn) {
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
