import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RequestStatus } from '../../../enums';
import { Router } from '@angular/router';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';

@Component({
    selector: 'app-bedes-search-results-table',
    templateUrl: './bedes-search-results-table.component.html',
    styleUrls: ['./bedes-search-results-table.component.scss']
})
export class BedesSearchResultsTableComponent implements OnInit, OnDestroy {
    public RequestStatus = RequestStatus;
    public currentRequestStatus: RequestStatus;
    public searchResults = new Array<BedesTerm | BedesConstrainedList>();
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public displayedColumns: string[] = ['buttons', 'name', 'description', 'termCategoryId', 'dataTypeId', 'unitId'];
    public dataSource = new MatTableDataSource<BedesTerm | BedesConstrainedList>();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    public hasSearched = false;
    private receivedInitialValues = false;

    constructor(
        private router: Router,
        private termSearchService: BedesTermSearchService,
        private termService: BedesTermService
    ) { }

    ngOnInit() {
        // subscribe to the search results service
        this.termSearchService.searchResultsSubject()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
                console.log(`${this.constructor.name}: received search results...`, results);
                this.searchResults = results;
                this.setTableDataSource(results);
                if(!this.receivedInitialValues) {
                    this.receivedInitialValues = true;
                }
                else {
                    this.hasSearched = true;
                }
            },
            (error: any) => {
                console.error(`${this.constructor.name}: error in ngOnInit`)
                console.error(error);
                throw error;
            });
        // subscribe to the requestStatus of the search
        // will indicate if the current state of the search
        this.termSearchService.requestStatusSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((newStatus: RequestStatus) => {
                console.log(`${this.constructor.name}: status = ${newStatus}`);
                this.currentRequestStatus = newStatus;
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
        this.dataSource.sort = this.sort;
    }

    public applyFilter(filterText: string): void {
        console.log('apply the table filter...', filterText);
    }

    /**
     * Navigates to the bedesTerm details view for the given term.
     * @param bedesTerm
     */
    public viewTerm(bedesTerm: BedesTerm | BedesConstrainedList): void {
        console.log(`${this.constructor.name}: view term`, bedesTerm);
        this.termService.selectedTermSubject.next(bedesTerm);
        this.router.navigate(['/bedes-term', bedesTerm.id]);
    }

}
