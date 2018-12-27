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

@Injectable({
    providedIn: 'root',
})
export class BedesTermResolverServiceService {

    constructor(
        private termService: BedesTermService,
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
        console.log(`${this.constructor.name}: resolve id ${value}`, typeof value);
        console.log('current selected value', this.termService.selectedTermSubject.getValue());
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        const selectedTerm = this.termService.selectedTermSubject.getValue();
        if (selectedTerm && selectedTerm.isMatch(value)) {
            return of(selectedTerm);
        }
        else {
            return this.termService.getTerm(value)
                .pipe(
                    take(1),
                    mergeMap(bedesTerm => {
                        console.log(`${this.constructor.name}: received results`, bedesTerm);
                        if (bedesTerm) {
                            this.termService.selectedTermSubject.next(bedesTerm);
                            return of(bedesTerm);
                        }
                        else {
                            this.router.navigate(['/search']);
                            return EMPTY;
                        }
                    }),
                    catchError((err: any, caught: any) => {
                        console.log('caught error');
                        console.log(err);
                        console.log(caught);
                        this.router.navigate(['/search']);
                        return EMPTY;
                    })
                );
        }
    }
}
