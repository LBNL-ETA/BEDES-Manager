import { Component, OnInit } from '@angular/core';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';

@Component({
  selector: 'app-bedes-search-query-builder',
  templateUrl: './bedes-search-query-builder.component.html',
  styleUrls: ['./bedes-search-query-builder.component.scss']
})
export class BedesSearchQueryBuilderComponent implements OnInit {

    public searchString: string;
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
    public searchForTerms(showPublicTerms: boolean = false, showCompositeTerms: boolean = true): void {
        this.waitingForResults = true;
        // TODO: redo this to use our own checkbox
        this.bedesTermSearchService.searchAndNotify([this.searchString], showPublicTerms, showCompositeTerms)
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
