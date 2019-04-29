import { Injectable, OnInit } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { ApplicationService } from './application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { take, mergeMap } from 'rxjs/operators';
import { AuthService } from '../../../bedes-auth/services/auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class ApplicationResolverService implements Resolve<MappingApplication> {
    constructor(
        private appService: ApplicationService,
        private authService: AuthService,
        private router: Router
    ) {
    }

    /**
     * Set the active MappingApplication when resolving the route to
     * a specific MappingApplication.
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MappingApplication> | Observable<never> {
        const appId: number = Number(route.paramMap.get('appId'));
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        // const selectedItem = this.appService.selectedItem;
        // if (selectedItem && selectedItem.id === appId) {
        //     return of(selectedItem);
        // }
        // else {
        //     this.appService.setActiveApplicationById(+appId);
        //     return of(this.appService.selectedItem);
        // }
        return this.appService.loadUserApplications()
        .pipe(
            take(1),
            mergeMap((results: Array<MappingApplication>): Observable<MappingApplication> | Observable<never> => {
                // const currentUser = this.authService.currentUserSubject.getValue();
                if (results) {
                    const app: MappingApplication | undefined = results.find(item => item.id === appId);
                    if (app) {
                        this.appService.setActiveApplication(app);
                        return of(app);
                    }
                }
                return EMPTY;
            })
        )
    }


}

