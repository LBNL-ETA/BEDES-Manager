import { Injectable, OnInit } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { ApplicationService } from './application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';

@Injectable({
    providedIn: 'root',
})
export class ApplicationResolverService {
    constructor(
        private appService: ApplicationService,
        private router: Router
    ) {
    }

    /**
     * Set the active MappingApplication when resolving the route to
     * a specific MappingApplication.
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MappingApplication> {
        const newId: number = Number(route.paramMap.get('id'));
        // check the current selected term for a matching id
        // don't make the http request if we already have the term selected
        const selectedItem = this.appService.selectedItem;
        if (selectedItem && selectedItem.id === newId) {
            return of(selectedItem);
        }
        else {
            this.appService.setActiveApplicationById(+newId);
            return of(this.appService.selectedItem);
        }
    }


}

