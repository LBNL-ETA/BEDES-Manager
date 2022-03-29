import { Injectable, OnInit } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { CompositeTermService } from './composite-term.service';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';

@Injectable({
    providedIn: 'root',
})
export class CompositeTermResolverService {
    constructor(
        private compositeTermService: CompositeTermService,
        private router: Router
    ) {
    }

    /**
     * Set the active BedesCompositeTerm when resolving the route to
     * a specific CompositeTerm.
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BedesCompositeTerm> {
        // const newId: number = Number(route.paramMap.get('id'));
        const routeId: string | null = route.paramMap.get('id');
        // if (routeId == null) {
        //     return of(new BedesCompositeTerm())
        // }
        // const newId = Number(routeId);
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        const selectedItem = this.compositeTermService.selectedTerm;
        if (selectedItem && routeId && selectedItem.uuid === routeId) {
            return of(selectedItem);
        } else if (routeId) {
            // A UUID was passed in the url and not the currently active composite term
            // Load the term details from the api
            this.compositeTermService.getTerm(routeId)
                .subscribe((compositeTerm: BedesCompositeTerm) => {
                    this.compositeTermService.setActiveCompositeTerm(compositeTerm);
                    return of(compositeTerm);
                });
        } else if (state.url.match(/\/composite-term\/edit\/?$/) || state.url.match(/\/map-composite-term\/?$/)) {
            const newTerm = this.compositeTermService.activateNewCompositeTerm();
            return of(newTerm);
        } else {
            this.compositeTermService.setActiveCompositeTerm(undefined);
            return of(undefined);
        }
    }


}

