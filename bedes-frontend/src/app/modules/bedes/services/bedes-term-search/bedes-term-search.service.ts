import { Injectable, Inject } from '@angular/core';
import { API_URL_TOKEN } from '../url/url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import {
    IBedesTerm,
    IBedesConstrainedList,
    BedesTerm,
    BedesConstrainedList
} from '@bedes-common/models/bedes-term';
import { RequestStatus } from '../../enums';
import { IBedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result.interface';
import { BedesSearchResult } from '../../../../../../../bedes-common/models/bedes-search-result/bedes-search-result';

@Injectable({
    providedIn: 'root'
})
export class BedesTermSearchService {
    private apiEndpoint = 'api/search-terms';
    private url: string = null;
    // Subject which emits the latest search result values.
    private _searchResultsSubject = new BehaviorSubject<Array<BedesSearchResult>>([]);
    // Subject which keeps track of the current state of the search.
    private currentRequestStatus = RequestStatus.OK;
    private _requestStatusSubject = new BehaviorSubject<RequestStatus>(this.currentRequestStatus);
    get requestStatusSubject(): BehaviorSubject<RequestStatus> {
        return this._requestStatusSubject;
    }

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
    public search(searchStrings: Array<string>): Observable<Array<BedesSearchResult>> {
        // build a params object to pass the search terms
        let httpParams = new HttpParams({
            fromObject: {
                search: searchStrings[0]
            }
        });
        // update the current search status
        this.setRequestStatus(RequestStatus.PENDING);
        // build the http params for each search term
        searchStrings.forEach(searchString => httpParams.append('search', String(searchString)))
        // returm the http request observable
        return this.http.get<Array<IBedesSearchResult>>(this.url, { params: httpParams, withCredentials: true })
            .pipe(
                map((results: Array<IBedesSearchResult>) => {
                    return results.map((item: IBedesSearchResult) => new BedesSearchResult(item));

                }),
                finalize(() => {
                    this.setRequestStatus(RequestStatus.OK);
                })
            );
    }

    private setRequestStatus(newStatus: RequestStatus): void {
        // update the search status and emit
        this.currentRequestStatus = newStatus;
        this._requestStatusSubject.next(this.currentRequestStatus);
    }

    /**
     * Searches for BedesTerms with matching searchString, but instead
     * of returning the Observable from the request, it takes the results
     * from the search and calls next() on the searchResultSubject.
     * @param searchStrings
     */
    public searchAndNotify(searchStrings: Array<string>): Observable<Array<BedesSearchResult>> {
        try {
            return this.search(searchStrings)
                .pipe(
                    map((results: Array<BedesSearchResult>) => {
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
    public searchResultsSubject(): BehaviorSubject<Array<BedesSearchResult>> {
        return this._searchResultsSubject;
    }

    /**
     * Broadcasts a set of BedesTerm objects, generated from a remote search, to all subscribers
     * of the search results observable (this.searchResultsSubject()).
     * @param searchResults
     */
    public broadcastResults(searchResults: Array<BedesSearchResult>): void {
        this._searchResultsSubject.next(searchResults);
    }
}
