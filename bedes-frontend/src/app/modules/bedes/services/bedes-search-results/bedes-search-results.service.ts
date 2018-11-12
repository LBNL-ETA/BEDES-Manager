import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';

@Injectable({
    providedIn: 'root'
})
export class BedesSearchResultsService {
    private _searchResultsSubject = new BehaviorSubject<Array<BedesTerm | BedesConstrainedList>>([]);

    constructor() { }

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
