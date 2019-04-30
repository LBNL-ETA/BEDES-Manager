import { Component, OnInit } from '@angular/core';
import { SupportListService } from '../../services/support-list/support-list.service';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category';
import { IBedesSearchResultOutput } from './bedes-search-parameters/bedes-search-parameters.component';
import { Observable, Subject } from 'rxjs';

@Component({
    selector: 'app-bedes-term-search',
    templateUrl: './bedes-term-search.component.html',
    styleUrls: ['./bedes-term-search.component.scss']
})
export class BedesTermSearchComponent implements OnInit {
    public categoryList: Array<BedesTermCategory>;
    public dataSource = new Subject<IBedesSearchResultOutput>();

    constructor(
        private supportListService: SupportListService
    ) {
        this.supportListService.termCategorySubject.subscribe(
            (categoryList: Array<BedesTermCategory>) => {
            console.log(`${this.constructor.name}: received category list`)
            console.log(categoryList);
            this.categoryList = categoryList;
        });
    }

    ngOnInit() {
        console.log(`${this.constructor.name}: ngOnInit`);
    }

    public handleSearchResultOutput(searchResults: IBedesSearchResultOutput): void {
        console.log(`${this.constructor.name}: handleNewSearchSTring...`, searchResults);
        this.dataSource.next(searchResults);
    }

}
