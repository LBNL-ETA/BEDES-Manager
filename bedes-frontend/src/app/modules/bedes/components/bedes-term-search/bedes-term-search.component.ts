import { Component, OnInit } from '@angular/core';
import { SupportListService } from '../../services/support-list/support-list.service';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category';
import { IBedesSearchResultOutput } from './bedes-search-parameters/bedes-search-parameters.component';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-bedes-term-search',
    templateUrl: './bedes-term-search.component.html',
    styleUrls: ['./bedes-term-search.component.scss']
})
export class BedesTermSearchComponent implements OnInit {
    public categoryList: Array<BedesTermCategory>;
    public dataSource = new BehaviorSubject<IBedesSearchResultOutput>(undefined);
    public currentResults: IBedesSearchResultOutput | undefined;

    constructor(
        private supportListService: SupportListService
    ) {
        this.supportListService.termCategorySubject.subscribe(
            (categoryList: Array<BedesTermCategory>) => {
                this.categoryList = categoryList;
            });
    }

    ngOnInit() {
    }

    /**
     * Handle the events from the search-parameter control
     * @param searchResults
     */
    public handleSearchResultOutput(searchResults: IBedesSearchResultOutput): void {
        this.currentResults = searchResults;
        this.dataSource.next(searchResults);
    }

}
