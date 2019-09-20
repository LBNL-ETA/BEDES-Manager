import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';
import { UserLogin } from '../../../models/auth/user-login';
import { UserLoginResponse } from '../../../models/auth/user-login-response';
import { getNextAuthUrl } from '../lib/get-next-url';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    // subject for unsibscribing from BehaviorSubjects
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    // boolean indicating if we're waiting for a response from the server.
    public waiting = false;
    // Holds the user authentication information (email and password)
    public userLogin: UserLogin;
    // boolean indicating if the login attempt was successfull.
    public loginSuccess = false;
    // Boolean indicating if a login error has occurred.
    public loginError = false;
    // The login error message to be displayed.
    public loginErrorMessage: string;
    // The current ePB user
    public currentUser: CurrentUser | undefined;

    /**
     * Creates an instance of LoginComponent.
     */
    constructor(
        private authService: AuthService,
        private router: Router,
    ) { }

    /**
     * Initialize the component.
    */
    ngOnInit() {
        // create a new UserLogin object
        this.userLogin = new UserLogin();
        this.subscribeToCurrentUser();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the currentUser BehaviorSubject to keep
     * the currentUser up-to-date.
     */
    private subscribeToCurrentUser(): void {
        this.authService.currentUserSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((currentUser: CurrentUser) => {
            this.currentUser = currentUser;
            // redirect to the correct authentication state
            if (!currentUser.isNotLoggedIn()) {
                const nextUrl = this.authService.getNextAuthUrl();
                this.router.navigateByUrl(nextUrl);
            }
        });
    }

    /**
     * Attempts to authenticate the user with the given credentials.
     */
    public login(): void {
        this.resetLoginError();
        this.waiting = true;
        this.authService.login(this.userLogin)
        .subscribe((userLoginResponse: UserLoginResponse) => {
                this.loginSuccess = true;
                console.log('LoginComponent analyze login response')
                // if (this.authService.needsVerify()) {
                //     let url: string;
                //     console.log('check url')
                //     if (
                //         this.authService.hasRedirectUrl()
                //         && this.authService.redirectUrl.match(/^\/home\/verify\/[a-zA-Z0-9]+/)
                //     ) {
                //         url = this.authService.redirectUrl;
                //     }
                //     else {
                //         url = '/home/verify'
                //     }
                //     console.log(`${this.constructor.name}: set url to ${url}`)
                //     // verify the account if need be
                //     // setTimeout(() => {
                //             this.router.navigateByUrl(url);
                //     //     },
                //     //     1000
                //     // );
                // }
                // else if (this.authService.hasRedirectUrl()) {
                //     // redirect to the original url if cought by the auth guard
                //     // get the redirect url and set to undefined
                //     const url = this.authService.redirectUrl;
                //     this.authService.redirectUrl = undefined;
                //     // setTimeout(() => {
                //             this.router.navigateByUrl(url);
                //     //     },
                //     //     1000
                //     // );
                // }
                // else if (this.authService.isLoggedIn()) {
                //     // setTimeout(() => {
                //             this.router.navigateByUrl('/home');
                //     //     },
                //     //     1000
                //     // );
                // }
                // else {
                //     throw new Error('An error occured processing the authentication response');
                // }
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
     * Determines if the current user is logged in or not.
     */
    public isLoggedIn(): boolean {
        return this.currentUser && this.currentUser.isNotLoggedIn() ? true : false;
    }

    /**
     * Reset the login error flag and message string.
     */
    private resetLoginError(): void {
        this.loginError = false;
        this.loginErrorMessage = null;
    }

    /**
     * Reset's the user password with the given email address.
     */
    public forgotPassword(): void {
        console.log('forgot password');
    }
}
