import { Injectable, OnInit } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { AppTermList, AppTerm } from '@bedes-common/models/app-term';
import { AppTermService } from '../app-term/app-term.service';
import { ApplicationService } from '../application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';

@Injectable({
    providedIn: 'root',
})
export class AppTermListResolverService {
    constructor(
        private appService: ApplicationService,
        private appTermService: AppTermService,
        private router: Router
    ) {
        this.appService.selectedItemSubject
            .subscribe((activeApp: MappingApplication) => {
                console.log(`${this.constructor.name}: activeApp`, activeApp)
            });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Array<AppTerm | AppTermList>> {
        const appTermId: number = Number(route.paramMap.get('termId'));
        const activeApp = this.appService.selectedItem;
        const appId: number | undefined = activeApp ? activeApp.id : undefined;

        console.log(`${this.constructor.name}: appId = ${appId}`, route, state);
        console.log(`active app: ${this.appService.selectedItem}`, this.appService.selectedItem)
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        if (this.appTermService.activeAppId === appId) {
            // console.log('active AppTerms already set', this.appTermService.getActiveTermList());
            const terms = this.appTermService.getActiveTermList();
            this.setActiveAppTerm(appTermId, terms);
            return of(terms);
        }
        else {
            console.log('load appTerms from API');
            this.appTermService.getAppTerms(appId)
            .subscribe((terms: Array<AppTerm | AppTermList>) => {
                console.log(`${this.constructor.name}: received appTerms`, terms);
                this.appTermService.setActiveMappingApplication(appId, terms);
                this.setActiveAppTerm(appTermId, terms);
                return of(terms);
            });
        }
    }

    /**
     * If there's a termId in the url, find the AppTerm with the matching id
     * in the list of terms.
     */
    private setActiveAppTerm(appTermId, terms: Array<AppTerm | AppTermList>): void {
        // make sure there's a valid appTerm
        if (!appTermId) {
            return;
        }
        // const termList = this.appTermService.getActiveTermList();
        const found = terms.find((d) => d.id === appTermId);
        if (found) {
            this.appTermService.setActiveTerm(found);
            return;
        }
        else {
            this.appTermService.setActiveTerm(undefined);
        }
    }


}

