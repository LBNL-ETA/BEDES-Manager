import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';

@Injectable({
    providedIn: 'root'
})
export class BedesTermSelectorService {
    private _selectedTermsSubject: BehaviorSubject<Array<BedesTerm | BedesConstrainedList>>;
    get selectedTermsSubject(): BehaviorSubject<Array<BedesTerm | BedesConstrainedList>> {
        return this._selectedTermsSubject;
    }

    constructor() {
        this._selectedTermsSubject = new BehaviorSubject<Array<BedesTerm | BedesConstrainedList>>([]);
    }

    /**
     *  Sets the selected terms BehaviorSubject.
     */
    public setSelectedTerms(terms: Array<BedesTerm | BedesConstrainedList>): void {
        this.selectedTermsSubject.next(terms);
    }
}
