import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';

@Component({
    selector: 'app-bedes-search-parameters',
    templateUrl: './bedes-search-parameters.component.html',
    styleUrls: ['./bedes-search-parameters.component.scss']
})
export class BedesSearchParametersComponent implements OnInit {
    public searchString: string;
    public waitingForResults = false;
    public searchError = false;
    public errorMessage: string;
    public numResults = 0;
    // get a reference to the search input control
    @Input('searchInput')
    private searchInput: ElementRef;

    constructor(
        private bedesTermSearchService: BedesTermSearchService,
    ) { }

    ngOnInit() {
        console.log('search input init!!!');
    }

    /**
     * Initiates the http request for the term search.
     */
    public searchForTerms(): void {
        console.log('search for terms...', this.searchString);
        console.log(this.searchInput);
        this.waitingForResults = true;
        this.bedesTermSearchService.searchAndNotify([this.searchString])
            .subscribe((results: Array<BedesSearchResult>) => {
                // set the number of rows found
                this.numResults = results.length;
            }, (error: any) => {
                this.numResults = 0;
            }, () => {
                this.waitingForResults = false;
            });
    }
}
