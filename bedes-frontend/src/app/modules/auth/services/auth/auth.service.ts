import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { API_URL_TOKEN } from 'src/app/services/api-url/api-url.service';

import { NewAccount } from '../../models/auth/new-account';
import { UserLogin } from '../../models/auth/user-login';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { IUserStatus } from '@bedes-common/interfaces/user-status';

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
    // user status
    private userStatus: UserStatus = UserStatus.NotLoggedIn;
    private _userStatusSubject: BehaviorSubject<UserStatus>;
    get userStatusSubject(): BehaviorSubject<UserStatus> {
        return this._userStatusSubject;
    }
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
        // create the user status BehaviorSubject
        this._userStatusSubject = new BehaviorSubject<UserStatus>(this.userStatus);
    }

    /**
     * Login a user.
     * @param userLogin
     * @returns login
     */
    public login(userLogin: UserLogin): Observable<IUserStatus> {
        console.log('login..', userLogin);
        // // open the waiting dialog, keep the reference object to close when request completes
        // const dialogRef = this.waitingDialog.open(WaitingDialogComponent, {
        //     panelClass: 'dialog-waiting',
        //     disableClose: true
        // });
        return this.http.post<IUserStatus>(this.urlLogin, userLogin, { withCredentials: true })
            .pipe(
                // finalize(() => dialogRef.close()),
                map((results: IUserStatus) => {
                    console.log('success!!', results);
                    this.userStatus = results.status;
                    console.log('new status = ', this.userStatus);
                    this.userStatusSubject.next(this.userStatus);
                    return results;
                }
            ));
    }

    public logout(): Observable<any> {
        console.log('call logout');
        return this.http.get<any>(this.urlLogout, { withCredentials: true })
        .pipe(map((results: any) => {
            console.log(`${this.constructor.name}: logout success`);
            this.userStatus = UserStatus.NotLoggedIn;
            this.userStatusSubject.next(this.userStatus);
            return true;
        }));
    }

    /**
     * Request a BEDES Manager account
     * @param newAccount
     * @returns account
     */
    public requestAccount(newAccount: NewAccount): Observable<IUserStatus> {
        console.log('new account...', newAccount);
        return this.http.post<IUserStatus>(this.urlNewAccount, newAccount, { withCredentials: true })
            .pipe(
                map((results: IUserStatus) => {
                    console.log('new account success!!', results);
                    return results;
                }
            ));
    }

    public checkLoginStatus(): Promise<any> {
        console.log('checkStatus...');
        return new Promise<any>((resolve, reject) => {
            this.http.get<IUserStatus>(this.urlStatus, { withCredentials: true })
            .subscribe((results: IUserStatus) => {
                console.log('checkLoginStatus complete...', results);
                if (results && results.status) {
                    this.userStatus = results.status;
                }
                else {
                    this.userStatus = UserStatus.NotLoggedIn;
                }
                this.userStatusSubject.next(this.userStatus);
                resolve();
            },
            (error) => {
                this.userStatus = UserStatus.NotLoggedIn;
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

    public verifyAccount(verificationCode: string): Observable<any> {
        return this.http.put<IUserStatus>(this.urlValidate, {verificationCode: verificationCode}, { withCredentials: true })
        .pipe(tap((data: IUserStatus) => {
            // console.log('veriy status', data);
            if (data && data.status) {
                this.userStatus = data.status;
            }
            else {
                // throw an error here?
                this.userStatus = UserStatus.NotLoggedIn;
            }
            // console.log('user status', this.userStatus);
            // console.log('logged in... next', this.redirectUrl);
            this.userStatusSubject.next(this.userStatus);
            // this.checkForRedirect();
        },
        (error) => {
            this.userStatus = UserStatus.NotLoggedIn;
            this.userStatusSubject.next(this.userStatus);
            // this.loggedInSubject.next(this.is_logged_in);
        }));
    }

    public newVerificationCode(): Observable<any> {
        try {
            return this.http.get<IUserStatus>(this.urlVerificationCode, { withCredentials: true });
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
    public updateUserStatus(newStatus: UserStatus): void {
        this.userStatus = newStatus;
        this.userStatusSubject.next(this.userStatus);
    }

    public needsRedirect(): boolean {
        return this.redirectUrl ? true : false;
    }

    public isLoggedIn(): boolean {
        return this.userStatus === UserStatus.IsLoggedIn ? true : false;
    }

    public needsVerify(): boolean {
        return this.userStatus === UserStatus.NeedsVerify ? true : false;
    }

    public needsPasswordReset(): boolean {
        return this.userStatus === UserStatus.PasswordResetRequired ? true : false;
    }

}
