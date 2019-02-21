import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { API_URL_TOKEN } from 'src/app/services/api-url/api-url.service';

import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { UserLoginResponse } from '../..//models/auth/user-login-response';
import { IUserLoginResponse } from '@bedes-common/interfaces/user-login-response.interface';
import { CurrentUser, ICurrentUser } from '@bedes-common/models/current-user';
import { IUserLogin } from '@bedes-common/interfaces/user-login.interface';
import { NewAccount } from '../../models/auth/new-account';
import { PasswordUpdate } from '@bedes-common/interfaces/password-update/password-update';

/**
 * Handles the interaction between the frontend components and the backend api
 * for authentication purposes.
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // api end point for the user status calls
    private apiEndpointStatus = 'api/status';
    private urlStatus: string = null;
    // api endoint for user login
    private apiEndpointLogin = 'api/login';
    private urlLogin: string = null;
    // api endoint for user logout
    private apiEndpointLogout = 'api/logout';
    private urlLogout: string = null;
    // api end point for code verification
    private apiEndpointVerify = 'api/verification-code';
    private urlVerify: string = null;
    // new account
    private apiEndpointNewAccount = 'api/user_profile';
    private urlNewAccount: string = null;
    // password-update
    private apiEndpointPasswordUpdate = 'api/password-update';
    private urlPasswordUpdate: string = null;
    // stores info about the current user
    private _currentUser: CurrentUser
    private _currentUserSubject: BehaviorSubject<CurrentUser>;
    get currentUserSubject(): BehaviorSubject<CurrentUser> {
        return this._currentUserSubject;
    }
    // stores a redirect url if the user was directed to a login
    // screen and needs to be sent back to the original target url
    private _redirectUrl: string | undefined;
    get redirectUrl(): string | undefined {
        return this._redirectUrl;
    }
    set redirectUrl(value: string | undefined) {
        this._redirectUrl = value;
    }

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        // set the login api url
        this.urlLogin = `${this.apiUrl}${this.apiEndpointLogin}`;
        // set the url for logouts
        this.urlLogout = `${this.apiUrl}${this.apiEndpointLogout}`;
        // set the authentication status api url
        this.urlStatus = `${this.apiUrl}${this.apiEndpointStatus}`;
        // set the code verification url
        this.urlVerify = `${this.apiUrl}${this.apiEndpointVerify}`;
        // url for new accounts
        this.urlNewAccount = `${ this.apiUrl }${ this.apiEndpointNewAccount }`;
        // url for password updates
        this.urlPasswordUpdate = `${ this.apiUrl }${ this.apiEndpointPasswordUpdate }`;
        // create a default user (ie a user with no privileges)
        this._currentUser = CurrentUser.makeDefaultUser();
        // setup the BehaviorSubject with the defualt user
        this._currentUserSubject = new BehaviorSubject<CurrentUser>(this._currentUser);
    }

    /* Public Implementation Methods */

    /**
     * Authentication the userLogin information against the backend api.
     *
     * @param userLogin Contains the authentication information for the current user.
     * @returns The authentication response
     */
    public login(userLogin: IUserLogin): Observable<IUserLoginResponse> {
        console.log('login..', userLogin);
        return this.http.post<ICurrentUser>(this.urlLogin, userLogin, {withCredentials: true})
            .pipe(
                map((results: ICurrentUser) => {
                    console.log('success!!', results);
                    this.setCurrentUser(new CurrentUser(results));
                    return new UserLoginResponse();
                }
            ));
    }

    /**
     * Logout the user that's currently logged in.
     * Will update the currentUser with a non-priviledged user
     * when call is complete.
     *
     * @returns {Observable<any>}
     */
    public logout(): Observable<any> {
        return this.http.get<any>(this.urlLogout, {withCredentials: true})
            .pipe(tap((results: any) => {
                // set the current user to the default user
                this.setCurrentUser(CurrentUser.makeDefaultUser())
            }));
    }

    /**
     * Request a BEDES Manager account
     * @param newAccount
     * @returns account
     */
    public requestAccount(newAccount: NewAccount): Observable<any> {
        console.log('new account...', newAccount);
        return this.http.post<any>(this.urlNewAccount, newAccount, { withCredentials: true });
    }

    public checkLoginStatus(): Promise<any> {
        console.log('checkStatus...');
        return new Promise<any>((resolve, reject) => {
            console.log('check status', this.urlStatus);
            this.http.get<ICurrentUser>(this.urlStatus, { withCredentials: true })
            .subscribe((results: ICurrentUser) => {
                console.log('checkLoginStatus complete...', results);
                // check for a valid login status
                if (results._status in UserStatus) {
                    this.setCurrentUser(new CurrentUser(results));
                }
                else {
                    // if not a valid status user the default unprivilidged user
                    this.setCurrentUser(CurrentUser.makeDefaultUser());
                }
                resolve();
            },
            (error) => {
                console.log('error checking userStatus', error);
                this._currentUser = CurrentUser.makeDefaultUser();
                this._currentUserSubject.next(this._currentUser);
                reject(error);
            })
        })
    }

    /**
     * Updates a user password
     * @param passwordUpdate The password values to apply to the current user.
     * @returns true if successfull, false otherwise
     */
    public updatePassword(passwordUpdate: PasswordUpdate): Observable<boolean> {
        console.log(`updatePassword ${passwordUpdate}`);
        if (!passwordUpdate || !passwordUpdate.isValid()) {
            throw new Error(`${this.constructor.name}: update expects valid passwords.`);
        }
        return this.http.put<boolean>(this.urlPasswordUpdate, passwordUpdate, {withCredentials: true})
            .pipe(tap((results: boolean) => {
                console.log('password update...', results);
                if (results) {
                    this.checkLoginStatus();
                }
            }));
    }

    /**
     * Verify a user registration code.
     */
    public verify(verificationCode: string): Observable<boolean> {
        console.log(`verify code ${verificationCode}`);
        if (!verificationCode) {
            throw new Error(`${this.constructor.name}: verify expects a verificationCode`);
        }
        const params = {
            verificationCode: verificationCode
        }
        const url = `${this.urlVerify}/${verificationCode}`;
        return this.http.post<boolean>(url, null, {withCredentials: true})
            .pipe(
                tap((results: boolean) => {
                    console.log('success!!', results);
                    this.checkLoginStatus();
                }
            ));
    }

    public newVerificationCode(): Observable<boolean> {
        console.log('newVerificationCode...', this.urlVerify);
        return this.http.get<ICurrentUser>(this.urlVerify, {withCredentials: true})
            .pipe(
                map((results: any) => {
                    console.log('newVerificationCode results...', results);
                    return true;
                }
            ));
    }

    /**
     * Retrieve's the url to navivate to after a user has been logged in.
     *
     * This is used for redirection purposes for user authentication.  If the user
     * attempts to navigate to an authenticated url, the authenticated url is stored
     * in this.redirectURL, then after login navigate back to this url.
     */
    public getPostLoginUrl(): string {
        if (this._currentUser.needsVerify()) {
            if (this.redirectUrl && this.redirectUrl.match(/\/home\/verify/)) {
                return this.redirectUrl;
            }
            else {
                return '/home/verify';
            }
        }
        else {
            return '/home';
        }
    }

    /**
     * Determines if the current user has been successfully authenticated.
     *
     * @returns true if the user has successfully logged in, false otherwise.
     */
    public isLoggedIn(): boolean {
        return this._currentUser.isLoggedIn();
    }

    /**
     * Determines if the current user needs to go through the email verification process.
     *
     * This is a wrapper around the CurrentUser.needsVerify() method.
     *
     * @returns true if the user's email needs to be verified, false otherwise.
     */
    public needsVerify(): boolean {
        return this._currentUser.needsVerify();
    }

    /**
     * Set the current user to an unprivilidged user
     */
    public setUnauthorizedUser(): void {
        console.log(`${this.constructor.name}: set unauthorized`);
        this.setCurrentUser(CurrentUser.makeDefaultUser());
    }

    /**
     * Set's the current authenticated (or not) user,
     * then calls `next()` on the currentUserSubject BehaviorSubject.
     */
    private setCurrentUser(newUser: CurrentUser): void {
        this._currentUser = newUser;
        console.log('set current user to...');
        console.log(newUser);
        this._currentUserSubject.next(this._currentUser);
    }

}
