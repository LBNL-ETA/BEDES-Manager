import { Component, OnInit, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';

export interface IBedesSearchResultOutput {
    searchString: string;
    results: Array<BedesSearchResult>;
}

@Component({
    selector: 'app-bedes-search-parameters',
    templateUrl: './bedes-search-parameters.component.html',
    styleUrls: ['./bedes-search-parameters.component.scss']
})
export class BedesSearchParametersComponent implements OnInit {
    @Output()
    searchResultOutput = new EventEmitter<IBedesSearchResultOutput>();
    @Input()
    public showCompositeTerms = true;
    // get a reference to the search input control
    @Input()
    private searchInput: ElementRef;

    public searchString: string;
    public showPublicTerms = false;
    public waitingForResults = false;
    public searchError = false;
    public errorMessage: string;
    public numResults = 0;

    constructor(
        private bedesTermSearchService: BedesTermSearchService,
    ) { }

    ngOnInit() {
    }

    /**
     * Initiates the http request for the term search.
     */
    public searchForTerms(event): void {
        if(!this.searchString) {
            throw new Error("Can't search for empty string.");
        }
        this.waitingForResults = true;
        this.bedesTermSearchService.search([this.searchString], this.showPublicTerms, this.showCompositeTerms)
        .subscribe((results: Array<BedesSearchResult>) => {
            // set the number of rows found
            this.numResults = results.length;
            // emit the new result set
            this.emitSearchResults(this.searchString, results);
        }, (error: any) => {
            this.numResults = 0;
        }, () => {
            this.waitingForResults = false;
        });
    }

    /**
     * Emits the search results
     * @param searchString
     * @param results
     */
    private emitSearchResults(searchString: string, results: Array<BedesSearchResult>): void {
        const outputObj: IBedesSearchResultOutput = {
            searchString: searchString,
            results: results
        }
        this.searchResultOutput.emit(outputObj);
    }
}
