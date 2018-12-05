import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BedesCompositeTerm } from '../../../../../../../bedes-common/models/bedes-composite-term/bedes-composite-term';
import {
    IBedesTerm,
    IBedesConstrainedList,
    BedesTerm,
    BedesConstrainedList
} from '@bedes-common/models/bedes-term';
import { IBedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term.interface';

@Injectable({
    providedIn: 'root'
})
export class CompositeTermService {
    private apiEndpoint = 'api/composite-term/:id';
    private url: string = null;
    // Subject that emits the currently selected CompositeTerm.
    private _selectedTermSubject = new BehaviorSubject<BedesCompositeTerm>(undefined);
    get selectedTermSubject(): BehaviorSubject<BedesCompositeTerm | undefined> {
        return this._selectedTermSubject;
    }
    // stores the currently active composite term
    private _selectedTerm: BedesCompositeTerm | undefined;
    get selectedTerm(): BedesCompositeTerm | undefined {
        return this._selectedTerm;
    }

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
    }

    /**
     * Fetch a CompositeTerm from the API
     * @param id
     * @returns term
     */
    public getTerm(id: number): Observable<BedesCompositeTerm> {
        const url = this.url.replace(/:id$/, String(id));
        console.log(`url = ${url}`);
        return this.http.get<IBedesCompositeTerm>(url, { withCredentials: true })
            .pipe(map((results: IBedesCompositeTerm) => {
                console.log(`${this.constructor.name}: received results`, results);
                return new BedesCompositeTerm(results);
            }));
    }

    /**
     * Saves a new CompositeTerm to the database.
     *
     * @param {BedesCompositeTerm} compositeTerm
     * @returns {Observable<BedesCompositeTerm>}
     * @memberof CompositeTermService
     */
    public saveNewTerm(compositeTerm: BedesCompositeTerm): Observable<BedesCompositeTerm> {
        return this.http.post<IBedesCompositeTerm>(this.url, compositeTerm)
        .pipe(map((results: IBedesCompositeTerm) => {
            console.log(`${this.constructor.name}: received results`, results);
            return new BedesCompositeTerm(results);
        }));
    }

    // public search(searchStrings: Array<string>): Observable<Array<BedesTerm | BedesConstrainedList>> {
    //     let httpParams = new HttpParams({
    //         fromObject: {
    //             search: searchStrings[0]
    //         }
    //     });
    //     searchStrings.forEach(searchString => httpParams.append('search', String(searchString)))
    //     return this.http.get<Array<IBedesCompositeTerm>>(this.url, { params: httpParams, withCredentials: true })
    //         .pipe(map((results) => {
    //             return results.map((item) =>
    //                 // if the object has an _options key it's a ContstrainedList
    //                 // everything else is a reguarl Term
    //                 item.hasOwnProperty('_options') ?
    //                 new BedesConstrainedList(<IBedesConstrainedList>item)
    //                 :
    //                 new BedesTerm(<IBedesTerm>item));
    //         }));
    // }
}

