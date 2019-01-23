import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { API_URL_TOKEN } from 'src/app/services/api-url/api-url.service';

import { NewAccount } from '../../models/auth/new-account';
import { UserLogin } from '../../models/auth/user-login';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { CurrentUser, ICurrentUser } from '@bedes-common/models/current-user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // login
    private apiEndpointLogin = 'api/login';
    private urlLogin: string = null;
    // validate
    private apiEndpointValidate = 'api/validate';
    private urlValidate: string;
    // new verification code
    private apiEndpointVerificationCode = 'api/verification-code';
    private urlVerificationCode: string;
    // logout
    private apiEndpointLogout = 'api/logout';
    private urlLogout: string = null;
    // new account
    private apiEndpointNewAccount = 'api/user_profile';
    private urlNewAccount: string = null;
    // current user
    private _currentUser: CurrentUser;
    private _currentUserSubject: BehaviorSubject<CurrentUser>;
    get currentUserSubject(): BehaviorSubject<CurrentUser> {
        return this._currentUserSubject;
    }
    // api end point for the user status calls
    private apiEndpointStatus = 'api/status';
    private urlStatus: string = null;
    // keeps track of redirection urls
    public redirectUrl: string;

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl,
        // public waitingDialog: MatDialog
    ) {
        this.urlLogin = `${ this.apiUrl }${ this.apiEndpointLogin }`;
        this.urlValidate = `${ this.apiUrl }${ this.apiEndpointValidate }`;
        this.urlVerificationCode = `${ this.apiUrl }${ this.apiEndpointVerificationCode }`;
        this.urlLogout = `${ this.apiUrl }${ this.apiEndpointLogout }`;
        this.urlNewAccount = `${ this.apiUrl }${ this.apiEndpointNewAccount }`;
        this.urlStatus = `${ this.apiUrl }${ this.apiEndpointStatus }`;
        // create a default user (Guest, NotLoggedIn)
        this._currentUser = CurrentUser.makeDefaultUser();
        this._currentUserSubject = new BehaviorSubject<CurrentUser>(this._currentUser);
    }

    /**
     * Login a user.
     * @param userLogin
     * @returns login
     */
    public login(userLogin: UserLogin): Observable<CurrentUser> {
        console.log('login..', userLogin);
        // // open the waiting dialog, keep the reference object to close when request completes
        // const dialogRef = this.waitingDialog.open(WaitingDialogComponent, {
        //     panelClass: 'dialog-waiting',
        //     disableClose: true
        // });
        return this.http.post<ICurrentUser>(this.urlLogin, userLogin, { withCredentials: true })
            .pipe(
                map((results: ICurrentUser) => {
                    console.log('success!!', results);
                    this._currentUser = new CurrentUser(results);
                    this.currentUserSubject.next(this._currentUser);
                    console.log(`${this.constructor.name} new currentUser = `, this._currentUser);
                    return this._currentUser;
                }
            ));
    }

    public logout(): Observable<any> {
        console.log('call logout');
        return this.http.get<ICurrentUser>(this.urlLogout, { withCredentials: true })
        .pipe(map((results: ICurrentUser) => {
            console.log(`${this.constructor.name}: logout success`);
            this._currentUser = CurrentUser.makeDefaultUser();
            this._currentUserSubject.next(this._currentUser);
            return true;
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
            this.http.get<ICurrentUser>(this.urlStatus, { withCredentials: true })
            .subscribe((results: ICurrentUser) => {
                console.log('checkLoginStatus complete...', results);
                if (results && results._status) {
                    this._currentUser = new CurrentUser(results);
                }
                else {
                    this._currentUser = CurrentUser.makeDefaultUser();
                }
                this._currentUserSubject.next(this._currentUser);
                resolve();
            },
            (error) => {
                this._currentUser = CurrentUser.makeDefaultUser();
                this._currentUserSubject.next(this._currentUser);
                resolve(error);
            })
        })
        // .subscribe((data) => {
        //     // console.log('login status', data);
        //     if (data && data.status) {
        //         this.userStatus = data.status;
        //     }
        //     else {
        //         // throw an error here?
        //         this.userStatus = UserStatus.NotLoggedIn;
        //     }
        //     // console.log('user status', this.userStatus);
        //     this._userStatusSubject.next(this.userStatus);
        //     // this.checkForRedirect();
        // },
        // (error) => {
        //     // console.log('error checking status', error);
        //     this.userStatus = UserStatus.NotLoggedIn;
        //     this._userStatusSubject.next(this.userStatus);
        // });

    }

    /**
     * Verify a new user account.
     */
    public verifyAccount(verificationCode: string): Observable<any> {
        return this.http.put<ICurrentUser>(this.urlValidate, {verificationCode: verificationCode}, { withCredentials: true })
        .pipe(tap((data: ICurrentUser) => {
            // console.log('veriy status', data);
            if (data && data._status) {
                this._currentUser = new CurrentUser(data);
            }
            else {
                this._currentUser = CurrentUser.makeDefaultUser();
            }
            this._currentUserSubject.next(this._currentUser);
        },
        (error) => {
            this._currentUser = CurrentUser.makeDefaultUser();
            this._currentUserSubject.next(this._currentUser);
        }));
    }

    public newVerificationCode(): Observable<any> {
        try {
            return this.http.get<ICurrentUser>(this.urlVerificationCode, { withCredentials: true });
        }
        catch (error) {
            console.log(`${this.constructor.name}: error in newVerificationCode()`);
            console.log(error);
            throw error;
        }
    }

    /**
     * Set's a new user status for the current user.
     *
     * @param {UserStatus} newStatus
     * @memberof AuthService
     */
    // public updateUserStatus(newStatus: UserStatus): void {
    //     this.userStatus = newStatus;
    //     this.userStatusSubject.next(this.userStatus);
    // }

    /**
     * Sets the currentUser to a default Guest user.
     */
    public setUnauthorizedUser(): void {
        this._currentUser = CurrentUser.makeDefaultUser();
        this._currentUserSubject.next(this._currentUser);
    }

    public needsRedirect(): boolean {
        return this.redirectUrl ? true : false;
    }

    public isLoggedIn(): boolean {
        return this._currentUser.isLoggedIn();
    }

    public needsVerify(): boolean {
        return this._currentUser.needsVerify();
    }

    public needsPasswordReset(): boolean {
        return this._currentUser.needsPasswordReset();
    }

}
