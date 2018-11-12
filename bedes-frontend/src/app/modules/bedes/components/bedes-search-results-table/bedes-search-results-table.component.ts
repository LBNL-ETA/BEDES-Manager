import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { IBedesTerm, BedesConstrainedList, BedesTerm } from '@bedes-common/bedes-term';
import { BedesTermSearchService } from '../../services/bedes-term-search/bedes-term-search.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-bedes-search-results-table',
    templateUrl: './bedes-search-results-table.component.html',
    styleUrls: ['./bedes-search-results-table.component.scss']
})
export class BedesSearchResultsTableComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public displayedColumns: string[] = ['name', 'description', 'dataTypeId', 'unitId'];
    public dataSource = new MatTableDataSource<BedesTerm | BedesConstrainedList>();
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private bedesTermSearchService: BedesTermSearchService
    ) { }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
        this.bedesTermSearchService.searchResultsSubject()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
                console.log(`${this.constructor.name}: received search results...`, results);
                this.setTableDataSource(results);
            },
            (error: any) => {
                console.error(`${this.constructor.name}: error in ngOnInit`)
                console.error(error);
                throw error;
            });
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private setTableDataSource(tableData: Array<BedesTerm | BedesConstrainedList>): void {
        this.dataSource = new MatTableDataSource(tableData);
        this.dataSource.paginator = this.paginator;
    }

}
