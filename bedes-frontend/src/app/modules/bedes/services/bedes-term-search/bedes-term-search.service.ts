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
export class BedesTermSearchService {
    private _searchResultsSubject = new BehaviorSubject<Array<BedesTerm | BedesConstrainedList>>([]);
    private apiEndpoint = 'api/search-terms';
    private url: string = null;

    constructor(
        private http: HttpClient,
        @Inject(API_URL_TOKEN) private apiUrl
    ) {
        this.url = `${this.apiUrl}${this.apiEndpoint}`;
    }

    /**
     * Searches the bedes terms that have matching searchStrings.
     * @param searchStrings
     * @returns search
     */
    public search(searchStrings: Array<string>): Observable<Array<BedesTerm | BedesConstrainedList>> {
        let httpParams = new HttpParams({
            fromObject: {
                search: searchStrings[0]
            }
        });
        searchStrings.forEach(searchString => httpParams.append('search', String(searchString)))
        return this.http.get<Array<IBedesTerm | IBedesConstrainedList>>(this.url, { params: httpParams, withCredentials: true })
            .pipe(map((results: Array<IBedesTerm | IBedesConstrainedList>) => {
                return results.map((item: IBedesTerm | IBedesConstrainedList) =>
                    // if the object has an _options key it's a ContstrainedList
                    // everything else is a reguarl Term
                    item.hasOwnProperty('_options') ?
                        new BedesConstrainedList(<IBedesConstrainedList>item)
                        :
                        new BedesTerm(<IBedesTerm>item));
            }));
    }

    /**
     * Searches for BedesTerms with matching searchString, but instead
     * of returning the Observable from the request, it takes the results
     * from the search and calls next() on the searchResultSubject.
     * @param searchStrings
     */
    public searchAndNotify(searchStrings: Array<string>): Observable<Array<BedesTerm | BedesConstrainedList>> {
        try {
            return this.search(searchStrings)
                .pipe(
                    map((results: Array<BedesTerm | BedesConstrainedList>) => {
                        this._searchResultsSubject.next(results);
                        return results;
                    })
                );
        }
        catch(error) {
            console.error(`${this.constructor.name}: Error in searchAndNotify`);
            console.error(error);
            throw error;
        }
    }

    /**
     * Returns the reference to the Observable responsible for sending out
     * the latest set of search results.
     * @returns results subject
     */
    public searchResultsSubject(): BehaviorSubject<Array<BedesTerm | BedesConstrainedList>> {
        return this._searchResultsSubject;
    }

    /**
     * Broadcasts a set of BedesTerm objects, generated from a remote search, to all subscribers
     * of the search results observable (this.searchResultsSubject()).
     * @param searchResults
     */
    public broadcastResults(searchResults: Array<BedesTerm | BedesConstrainedList>): void {
        this._searchResultsSubject.next(searchResults);
    }
}
