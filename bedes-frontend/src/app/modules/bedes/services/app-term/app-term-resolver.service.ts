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
import { IAppTerm } from '../../../../../../../bedes-common/models/app-term/app-term.interface';
import { TermType } from '@bedes-common/enums/term-type.enum';

@Injectable({
    providedIn: 'root',
})
export class AppTermResolverService {
    constructor(
        private ApplicationService: ApplicationService,
        private appTermService: AppTermService,
        private router: Router
    ) {

    }

    /**
     * Resolve the required data from the API for the aop-term route.
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AppTerm | AppTermList | undefined> {
        const appTermId = Number(route.paramMap.get('termId'));
        console.log(`${this.constructor.name}: appTermId = ${appTermId}`, route, state);
        // get a reference to the current active AppTerm
        let activeItem = appTermId ? this.appTermService.activeTerm : undefined;
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        if (activeItem && appTermId && activeItem.id === appTermId) {
            // the termId is the same as the activeTerm
            console.log('active AppTerms already set', activeItem);
            return of(activeItem);
        }
        else if (appTermId) {
            // activeTerm is different from what's requested in the url
            // first check the existing list of terms, if it exists
            // if it doesn't, load the complete list of the term and its siblings
            activeItem = this.appTermService.findTermInList(appTermId);
            if (activeItem) {
                // term is in the current active list of AppTerms
                return of(activeItem);
            }
            else {
                // all else fails, load terms from API
                console.log('load appTerm from API');
                this.appTermService.getAppTermSiblings(appTermId)
                .subscribe((terms: Array<AppTerm | AppTermList>) => {
                    console.log(`${this.constructor.name}: received appTerms`, terms);
                    this.appTermService.setActiveMappingApplication(appTermId, terms);
                    const activeTerm = terms.find((d) => d.id === appTermId);
                    if (!activeTerm) {
                        return of(undefined)
                    }
                    else {
                        this.appTermService.setActiveTerm(activeTerm);
                        return of(activeTerm);
                    }
                });
            }
        }
        else if (state.url.match(/\/\d+\/terms\/new/)) {
            // create a new AppTerm
            const params: IAppTerm = {
                _name: 'New App Term',
                _termTypeId: TermType.Atomic
            }
            const newTerm = new AppTerm(params);
            this.appTermService.setActiveTerm(newTerm);
            return of(newTerm);
        }
        else {
            this.appTermService.setActiveTerm(undefined);
            return of(undefined);
        }
    }

}
