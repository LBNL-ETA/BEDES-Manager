import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    IBedesTerm,
    IBedesConstrainedList,
    BedesTerm,
    BedesConstrainedList
} from '@bedes-common/models/bedes-term';

@Injectable({
    providedIn: 'root'
})
export class BedesTermService {
    private apiEndpoint = 'api/bedes-term/:id';
    private url: string = null;
    // Subject that emits the currently selected BedesTerm.
    private _selectedTermSubject = new BehaviorSubject<BedesTerm | BedesConstrainedList>(undefined);
    get selectedTermSubject(): BehaviorSubject<BedesTerm | BedesConstrainedList | undefined> {
        return this._selectedTermSubject;
    }
    private _selectedTerm: BedesTerm | BedesConstrainedList | undefined;
    get selectedTerm(): BedesTerm | BedesConstrainedList | undefined {
        return this._selectedTerm;
    }

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
    }

    /**
     * Fetch a BedesTerm or BedesConstrainedList  from the server.
     * @param id
     * @returns term
     */
    public getTerm(id: number): Observable<BedesTerm | BedesConstrainedList> {
        const url = this.url.replace(/:id$/, String(id));
        console.log(`url = ${url}`);
        return this.http.get<IBedesTerm | IBedesConstrainedList>(url, { withCredentials: true })
            .pipe(map((results: IBedesTerm | IBedesConstrainedList) => {
                console.log(`${this.constructor.name}: received results`, results);
                if (<IBedesConstrainedList>results['_options']) {
                    return new BedesConstrainedList(<IBedesConstrainedList>results);
                }
                else {
                    return new BedesTerm(results);
                }
            }));
    }

    // public search(searchStrings: Array<string>): Observable<Array<BedesTerm | BedesConstrainedList>> {
    //     let httpParams = new HttpParams({
    //         fromObject: {
    //             search: searchStrings[0]
    //         }
    //     });
    //     searchStrings.forEach(searchString => httpParams.append('search', String(searchString)))
    //     return this.http.get<Array<IBedesTerm | IBedesConstrainedList>>(this.url, { params: httpParams, withCredentials: true })
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
