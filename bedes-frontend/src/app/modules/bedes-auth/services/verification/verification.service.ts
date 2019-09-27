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

    /**
     * Verify a verification code for the current user.
     */
    public verify(verificationCode: string): Observable<CurrentUser> {
        return this.http.post<ICurrentUser>(this.url, verificationCode)
            .pipe(
                map((results: ICurrentUser) => {
                    return new CurrentUser(results);
                }
            ));
    }

}
