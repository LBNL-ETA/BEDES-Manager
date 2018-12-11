import { Injectable, OnInit } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
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
        const id = Number(route.paramMap.get('id'));
        console.log(`${this.constructor.name}: resolve id ${id}`);
        console.log('current selected value', this.termService.selectedTermSubject.getValue());
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        const selectedTerm = this.termService.selectedTermSubject.getValue();
        if (selectedTerm && selectedTerm.id === id) {
            return of(selectedTerm);
        }
        else {
            return this.termService.getTerm(Number(id))
                .pipe(
                    // take(1),
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
                    })
                );
        }
    }
}
