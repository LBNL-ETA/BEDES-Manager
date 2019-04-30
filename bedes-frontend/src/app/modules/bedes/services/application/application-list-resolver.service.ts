import { Injectable, OnInit } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { ApplicationService } from './application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { AuthService } from '../../../bedes-auth/services/auth/auth.service';
import { take, mergeMap } from 'rxjs/operators';
import { CurrentUser } from '../../../../../../../bedes-common/models/current-user/current-user';

export interface IApplicationListParams {
    applicationList: Array<MappingApplication>;
    currentUser: CurrentUser
}

@Injectable({
    providedIn: 'root',
})
export class ApplicationListResolverService {
    constructor(
        private appService: ApplicationService,
        private authService: AuthService
    ) {
    }

    /**
     * Set the active BedesCompositeTerm when resolving the route to
     * a specific CompositeTerm.
     */
    resolve(): Observable<IApplicationListParams> {
        return this.appService.loadUserApplications()
        .pipe(
            take(1),
            mergeMap((results: Array<MappingApplication>) => {
                const currentUser = this.authService.currentUserSubject.getValue();
                if (results) {
                    return of({applicationList: results, currentUser: currentUser});
                }
                else {
                    return of({applicationList: [], currentUser: currentUser});
                }
            })
        )
    }


}

