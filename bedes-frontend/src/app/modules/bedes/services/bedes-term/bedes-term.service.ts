import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    IBedesTerm,
    IBedesConstrainedList,
    BedesTerm,
    BedesConstrainedList
} from '@bedes-common/bedes-term';

@Injectable({
    providedIn: 'root'
})
export class BedesTermService {
    private apiEndpoint = 'api/search-terms';
    private url: string = null;

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
    }

    public search(searchStrings: Array<string>): Observable<Array<BedesTerm | BedesConstrainedList>> {
        let httpParams = new HttpParams({
            fromObject: {
                search: searchStrings[0]
            }
        });
        searchStrings.forEach(searchString => httpParams.append('search', String(searchString)))
        return this.http.get<Array<IBedesTerm | IBedesConstrainedList>>(this.url, { params: httpParams, withCredentials: true })
            .pipe(map((results) => {
                return results.map((item) =>
                    // if the object has an _options key it's a ContstrainedList
                    // everything else is a reguarl Term
                    item.hasOwnProperty('_options') ?
                    new BedesConstrainedList(<IBedesConstrainedList>item)
                    :
                    new BedesTerm(<IBedesTerm>item));
            }));
    }
}
