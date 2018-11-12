import { Component, OnInit } from '@angular/core';
import { BedesTermService } from '../../services/bedes-term/bedes-term.service';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/bedes-term';
import { BedesTermSearchService } from '../../services/bedes-term-search/bedes-term-search.service';

@Component({
    selector: 'app-bedes-term-search',
    templateUrl: './bedes-term-search.component.html',
    styleUrls: ['./bedes-term-search.component.scss']
})
export class BedesTermSearchComponent implements OnInit {
    public searchString: string;

    constructor(
        private bedesTermSearchService: BedesTermSearchService
    ) {}

    ngOnInit() {
    }

    public searchForTerms(): void {
        console.log('search for terms...', this.searchString);
        this.bedesTermSearchService.searchAndNotify([this.searchString])
            .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
                console.log(`${this.constructor.name}: received search results`);
                console.log(results);
            }, (error: any) => {
                console.log(`${this.constructor.name}: error in searchTerms`);
                console.log(error);
            });
    }

}
