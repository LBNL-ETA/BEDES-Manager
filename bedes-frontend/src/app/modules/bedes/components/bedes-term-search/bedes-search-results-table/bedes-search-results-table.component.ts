import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RequestStatus } from '../../../enums';
import { Router } from '@angular/router';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { GridOptions, SelectionChangedEvent, ColDef, ValueGetterParams, ICellRendererParams, Context } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { SupportListType } from '../../../services/support-list/support-list-type.enum';
import { TableCellTermNameComponent } from './table-cell-term-name/table-cell-term-name.component';
import { BedesSearchResult } from '../../../../../../../../bedes-common/models/bedes-search-result/bedes-search-result';
import { SearchResultType } from '../../../../../../../../bedes-common/models/bedes-search-result/search-result-type.enum';

interface ISearchResultRow {
    name: string,
    uuid: string,
    categoryName: string,
    unitName: string,
    dataTypeName: string,
    ref: BedesSearchResult,
    searchResultTypeName: string
}

@Component({
    selector: 'app-bedes-search-results-table',
    templateUrl: './bedes-search-results-table.component.html',
    styleUrls: ['./bedes-search-results-table.component.scss']
})
export class BedesSearchResultsTableComponent implements OnInit, OnDestroy {
    public RequestStatus = RequestStatus;
    public currentRequestStatus: RequestStatus;
    public searchResults = new Array<BedesSearchResult>();
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public hasSearched = false;
    private receivedInitialValues = false;
    private gridInitialized = false;
    private initialized = false;

    // lists
    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;

    constructor(
        private router: Router,
        private termSearchService: BedesTermSearchService,
        private termService: BedesTermService,
        private supportListService: SupportListService
    ) {}

    ngOnInit() {
        this.receivedInitialValues = false;
        this.hasSearched = false;
        this.gridInitialized = false;
        this.initialized = false;

        this.gridSetup();
        this.setTableContext();
        // subscribe to the search results service
        this.termSearchService.searchResultsSubject()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesSearchResult>) => {
                console.log(`${this.constructor.name}: received search results...`, results);
                // set the search results
                this.searchResults = results;
                // if the grid is ready then set the grid data
                // otherwise setting the grid data is done after grid initialization
                if (this.gridInitialized) {
                    this.setGridData();
                    if(!this.receivedInitialValues) {
                        this.receivedInitialValues = true;
                    }
                    else {
                        this.hasSearched = true;
                    }
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

    /**
     * Navigates to the bedesTerm details view for the given term.
     * @param selectedItem
     */
    public viewTerm(selectedItem: ISearchResultRow): void {
        console.log(`${this.constructor.name}: view term`, selectedItem);
        if (selectedItem.ref.resultObjectType === SearchResultType.BedesTerm || selectedItem.ref.resultObjectType === SearchResultType.BedesConstrainedList) {
            this.router.navigate(['/bedes-term', selectedItem.ref.uuid]);
        }
        // this.termService.selectedTermSubject.next(bedesTerm);
    }

    /**
     * Setup the ag-grid for the list of projects.
     */
    private gridSetup(): void {
        this.gridOptions = <GridOptions>{
            enableRangeSelection: true,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            rowSelection: 'multiple',
            columnDefs: this.buildColumnDefs(),
            // getRowNodeId: (data: any) => {
            //     return data.uuid;
            // },
            onGridReady: () => {
                this.gridInitialized = true;
                if (this.gridOptions && this.gridOptions.api && this.searchResults && !this.initialized) {
                    console.log(`** ${this.constructor.name}: call to setRowData`);
                    // this.gridOptions.api.setRowData(this.searchResults);
                    this.setGridData();
                }
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                console.log('selection changed', event.api.getSelectedRows());
            }
        };
    }

    /**
     * Set the execution context for the table.  Used for cell renderers
     * to be able to access the parent component methods.
     */
    private setTableContext(): void {
        this.tableContext = {
            parent: this
        };
    }

    /**
     * Builds the column definitions for the list of projects.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'name',
                minWidth: 250,
                cellRendererFramework: TableCellTermNameComponent
            },
            {
                headerName: 'Type',
                field: 'searchResultTypeName'
            },
            {
                headerName: 'UUID',
                field: 'uuid'
            },
            {
                headerName: 'Category',
                field: 'categoryName'
            },
            {
                headerName: 'Unit',
                field: 'unitName'
            },
            {
                headerName: 'Data Type',
                field: 'dataTypeName'
            }
        ];
    }

    private setGridData() {
        if (this.gridOptions && this.gridOptions.api && this.searchResults && this.gridInitialized) {
            const gridData = this.searchResults.map((searchResult: BedesSearchResult) => {
                return <ISearchResultRow>{
                    name: searchResult.name,
                    uuid: searchResult.uuid,
                    // categoryName: this.supportListService.transformIdToName(SupportListType.BedesCategory, term.termCategoryId),
                    // dataTypeName: this.supportListService.transformIdToName(SupportListType.BedesDataType, term.dataTypeId),
                    unitName: this.supportListService.transformIdToName(SupportListType.BedesUnit, searchResult.unitId),
                    ref: searchResult,
                    searchResultTypeName: this.getResultTypeName(searchResult.resultObjectType)
                }
            });
            this.gridOptions.api.setRowData(gridData);
            this.initialized = true;
        }
    }

    /**
     * Returns the type of result object from the search,
     * ie is it a constrained list? or composite term?
     */
    private getResultTypeName(searchResultType: SearchResultType): string {
        if (searchResultType === SearchResultType.BedesTerm) {
            return 'BEDES Term';
        }
        else if (searchResultType === SearchResultType.BedesConstrainedList) {
            return 'Constrained List';
        }
        else if (searchResultType === SearchResultType.BedesTermOption) {
            return 'Constrained List Option';
        }
        else if (searchResultType === SearchResultType.CompositeTerm) {
            return 'Composite Term';
        }
        else {
            '';
        }
    }

}
