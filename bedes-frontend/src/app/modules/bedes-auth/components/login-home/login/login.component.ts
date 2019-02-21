import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog} from '@angular/material';

import { AuthService } from '../../../services/auth/auth.service';
import { UserLogin } from '../../../models/auth/user-login';
import { UserLoginResponse } from '../../../models/auth/user-login-response';
import { getNextAuthUrl } from '../lib/get-next-url';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
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
        private activatedRoute: ActivatedRoute
    ) { }

    /**
     * Initialize the component.
    */
    ngOnInit() {
        // create a new UserLogin object
        this.userLogin = new UserLogin();
        this.subscribeToCurrentUser();
    }

    /**
     * Subscribe to the currentUser BehaviorSubject to keep
     * the currentUser up-to-date.
     */
    private subscribeToCurrentUser(): void {
        this.authService.currentUserSubject
        .subscribe((currentUser: CurrentUser) => {
            this.currentUser = currentUser;
            const nextUrl = getNextAuthUrl(currentUser.status);
            console.log(`${this.constructor.name}: new user status ${currentUser.status}, navigate to ${nextUrl}`);
            this.router.navigateByUrl(nextUrl);
        });
    }

    /**
     * Attempts to authenticate the user with the given credentials.
     */
    public login(): void {
        this.resetLoginError();
        this.waiting = true;
        console.log('calling authservice loing...', this.userLogin);
        this.authService.login(this.userLogin).subscribe(
            (userLoginResponse: UserLoginResponse) => {
                console.log(`${this.constructor.name}: received response`, userLoginResponse);
                this.loginSuccess = true;
                const url = this.authService.getPostLoginUrl();
                // navigate to home after 1 second
                setTimeout(() => {
                        this.router.navigateByUrl(url);
                    },
                    1000
                );
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
        // TODO: write this
    }
}
