import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_URL_TOKEN } from 'src/app/services/api-url/api-url.service';
import { map } from 'rxjs/operators';
import { CurrentUser, ICurrentUser } from '@bedes-common/models/current-user';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
    // api end point for the user status calls
    private apiEndpoint = 'api/verification-code';
    private url: string = null;

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl,
        private authService: AuthService
    ) {
    }

    /* Public Implementation Methods */

    // public newVerificationCode(): Observable<any> {
    //     this.http.get<ICurrentUser>(this.url)
    // }

    /**
     * Verify a verification code for the current user.
     *
     * @param verificationCode The verification code for the user to verify.
     * @returns {Observable<CurrentUser>}
     * @memberof VerificationService
     */
    public verify(verificationCode: string): Observable<CurrentUser> {
        console.log(`verify code ${verificationCode}`);
        const params = {
            verificationCode: verificationCode
        }
        return this.http.post<ICurrentUser>(this.url, verificationCode)
            .pipe(
                map((results: ICurrentUser) => {
                    console.log('success!!', results);
                    // this.authService.setCurrentUser(new CurrentUser(results));
                    return new CurrentUser(results);
                }
            ));
    }

}
