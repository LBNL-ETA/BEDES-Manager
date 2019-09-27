import { Injectable, OnInit } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take, catchError } from 'rxjs/operators';
import { BedesTermService } from '../bedes-term/bedes-term.service';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermListOptionService } from '../bedes-term-list-option/bedes-term-list-option.service';

@Injectable({
    providedIn: 'root',
})
export class BedesTermResolverService {

    constructor(
        private termService: BedesTermService,
        private listOptionService: BedesTermListOptionService,
        private router: Router
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BedesTerm | BedesConstrainedList> | Observable<never> {
        let value: string | number = route.paramMap.get('id');
        // turn the string into a number if all characters are digits
        // ie this is a numeric id value
        if (value.match(/^\d+$/)) {
            value = Number(value);
        }
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        const selectedTerm = this.termService.selectedTermSubject.getValue();
        if (selectedTerm && selectedTerm.isMatch(value)) {
            // check if we're editing a list option, which will have an id after /edit/
            // need to set the selected list option if it isn't set
            if (selectedTerm instanceof BedesConstrainedList) {
                this.checkForActiveTermOption(selectedTerm, state);
            }
            return of(selectedTerm);
        }
        else {
            return this.termService.getTerm(value)
                .pipe(
                    take(1),
                    mergeMap(bedesTerm => {
                        if (bedesTerm) {
                            // set the term as the "selected term"
                            this.termService.selectedTermSubject.next(bedesTerm);
                            // check if a list option needs to be activated
                            // ie a BedesTermOption id was passed in the url
                            if (bedesTerm instanceof BedesConstrainedList) {
                                this.checkForActiveTermOption(bedesTerm, state);
                            }
                            return of(bedesTerm);
                        }
                        else {
                            this.router.navigate(['/search']);
                            return EMPTY;
                        }
                    }),
                    catchError((err: any, caught: any) => {
                        this.router.navigate(['/search']);
                        return EMPTY;
                    })
                );
        }
    }

    /**
     * Check for any list options that need to be activated.
     */
    public checkForActiveTermOption(term: BedesConstrainedList, state: RouterStateSnapshot): void {
        // check for a match on the edit route
        const results = state.url.match(/\/edit\/(.*)/);
        if (results) {
            // the id/uuid will be in the captured regex group
            // use it to retrieve the option on the selected term
            const listOptionId = results[1];
            const termOption = term.getOption(listOptionId);
            if (termOption) {
                // set the option to active if found
                this.listOptionService.activeListOptionSubject.next(termOption);
            }
        }

    }
}
