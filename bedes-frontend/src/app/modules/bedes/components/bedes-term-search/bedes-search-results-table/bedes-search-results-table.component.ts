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

interface ISearchResultRow {
    name: string,
    uuid: string,
    categoryName: string,
    unitName: string,
    dataTypeName: string,
    ref: BedesTerm | BedesConstrainedList
}

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
    ) { }

    ngOnInit() {
        this.gridSetup();
        this.setTableContext();
        // subscribe to the search results service
        this.termSearchService.searchResultsSubject()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
                console.log(`${this.constructor.name}: received search results...`, results);
                this.searchResults = results;
                this.setTableDataSource(results);
                this.setGridData();
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

    private buildGridData(): Array<ISearchResultRow> {
        const results = new Array<ISearchResultRow>();
        this.searchResults.map((d) => <ISearchResultRow>{
            name: d.name,
            uuid: d.uuid,

        })

        return results;
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
            getRowNodeId: (data: any) => {
                return data.uuid;
            },
            onGridReady: () => {
                if (this.gridOptions && this.gridOptions.api && this.searchResults) {
                    console.log(`** ${this.constructor.name}: call to setRowData`);
                    // this.gridOptions.api.setRowData(this.searchResults);
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
                // cellRenderer: (params: any): string => {
                //     return ` <button mat-mini-fab color="accent" (click)="viewTerm(element)">
                //     <fa-icon [icon]="['fas', 'search']">
                //     </fa-icon>
                // </button>`;
                // }
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
            // {
            //     headerName: 'Category',
            //     field: 'termCategoryId',
            //     cellRenderer: (params: any): string => {
            //         return `
            //         <span>
            //             ${this.supportListService.transformIdToName(SupportListType.BedesCategory, params.value)}
            //         </span>
            //     `
            //     }
            // },
            // {
            //     headerName: 'Data Type',
            //     field: 'dataTypeId',
            //     cellRenderer: (params: any): string => {
            //         return `<span>${this.supportListService.transformIdToName(SupportListType.BedesDataType, params.value)}</span>`
            //     }
            // },
            // {
            //     headerName: 'Unit',
            //     field: 'unitId',
            //     cellRenderer: (params: any): string => {
            //         return `<span>${this.supportListService.transformIdToName(SupportListType.BedesUnit, params.value)}</span>`
            //     }
            // },
            // {
            //     headerName: 'Modified Date',
            //     field: 'modifiedDate',
            //     cellRendererFramework: TableCellDateComponent
            // },
            // {
            //     headerName: 'Organization',
            //     field: 'customerOrg',
            //     editable: true,
            //     cellStyle: () => {
            //         return 'padding: 0;';
            //     }
            // },
            // {
            //     headerName: 'ESCO',
            //     field: 'ESCOName'
            // },
            // {
            //     headerName: 'Total Implementation Price',
            //     field: 'totalImplementationPrice',
            //     cellRendererFramework: TableCellCurrencyComponent
            // },
            // {
            //     headerName: 'Total Guaranteed Cost Savings',
            //     field: 'totalGuarCostSavings',
            //     cellRendererFramework: TableCellCurrencyComponent
            // },
        ];
    }

    private setGridData() {
        if (this.gridOptions && this.gridOptions.api && this.searchResults) {
            const gridData = this.searchResults.map((term: BedesTerm | BedesConstrainedList) => {
                return <ISearchResultRow>{
                    name: term.name,
                    uuid: term.uuid,
                    categoryName: this.supportListService.transformIdToName(SupportListType.BedesCategory, term.termCategoryId),
                    dataTypeName: this.supportListService.transformIdToName(SupportListType.BedesDataType, term.dataTypeId),
                    unitName: this.supportListService.transformIdToName(SupportListType.BedesUnit, term.unitId),
                    ref: term
                }
            });
            this.gridOptions.api.setRowData(gridData);
        }
    }


}
