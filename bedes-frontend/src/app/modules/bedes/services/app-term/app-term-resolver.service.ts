import { Injectable, OnInit } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { AppTermList, AppTerm } from '@bedes-common/models/app-term';
import { AppTermService } from './app-term.service';
import { ApplicationService } from '../application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AppTermResolverService {
    constructor(
        private appService: ApplicationService,
        private appTermService: AppTermService,
        private router: Router
    ) {
        this.appService.selectedItemSubject
            .subscribe((activeApp: MappingApplication) => {
            });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AppTerm | AppTermList> {
        const appTermUUID: string = route.paramMap.get('termId');
        const appId = Number(route.parent.paramMap.get('appId'));
        const activeApp = this.appService.selectedItem;
        // const appId: number | undefined = activeApp ? activeApp.id : undefined;
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        if (!appTermUUID) {
            // new app term
            return of(AppTermService.createNewAppTerm());
        }
        else if (activeApp && this.appTermService.activeAppId === appId) {
            const terms = this.appTermService.getActiveTermList();
            const found = this.setActiveAppTerm(appTermUUID, terms);
            if (found) {
                return of(found);
            }
            else {
                return this.appTermService.getAppTerms(appId)
                .pipe(
                    switchMap((terms: Array<AppTerm | AppTermList>): Observable<AppTerm | AppTermList> => {
                        this.appTermService.setActiveMappingApplication(appId, terms);
                        const newTerm = this.setActiveAppTerm(appTermUUID, terms);
                        return of(newTerm);
                    })
                )
            }
        }
        else {
            this.appTermService.getAppTerms(appId)
            .subscribe((terms: Array<AppTerm | AppTermList>) => {
                this.appTermService.setActiveMappingApplication(appId, terms);
                const found = this.setActiveAppTerm(appTermUUID, terms);
                return of(found);
            });
        }
    }

    /**
     * If there's a termId in the url, find the AppTerm with the matching id
     * in the list of terms.
     */
    private setActiveAppTerm(appTermId, terms: Array<AppTerm | AppTermList>): AppTerm | AppTermList | undefined {
        // make sure there's a valid appTerm
        if (!appTermId) {
            return;
        }
        // const termList = this.appTermService.getActiveTermList();
        const found = terms.find((item) => item.uuid === appTermId);
        this.appTermService.setActiveTerm(found);
        return found;
    }


}

