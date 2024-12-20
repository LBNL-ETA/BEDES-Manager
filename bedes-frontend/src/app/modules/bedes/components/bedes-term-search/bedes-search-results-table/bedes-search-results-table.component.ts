import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RequestStatus } from '../../../enums';
import { Router } from '@angular/router';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { GridApi, GridReadyEvent, GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { SupportListType } from '../../../services/support-list/support-list-type.enum';
import { TableCellTermNameComponent } from './table-cell-term-name/table-cell-term-name.component';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';
import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';
import { ISearchResultRow } from '../../../models/ag-grid/search-result-row.interface';
import { getResultTypeName } from '../../../lib/get-result-type-name';
import { IBedesSearchResultOutput } from '../bedes-search-parameters/bedes-search-parameters.component';
import { scopeList } from '../../../../../../../../bedes-common/lookup-tables/scope-list';

@Component({
    selector: 'app-bedes-search-results-table',
    templateUrl: './bedes-search-results-table.component.html',
    styleUrls: ['./bedes-search-results-table.component.scss']
})
export class BedesSearchResultsTableComponent implements OnInit, OnDestroy {
    @Input()
    dataSource: Subject<IBedesSearchResultOutput> | undefined;
    public RequestStatus = RequestStatus;
    public currentRequestStatus: RequestStatus;
    public searchResults = new Array<BedesSearchResult>();
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public hasSearched = false;
    private receivedInitialValues = false;
    public gridData = new Array<ISearchResultRow>();
    private gridInitialized = false;
    private initialized = false;

    // lists
    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;
    // ag-grid
    public gridOptions: GridOptions;
    private gridApi: GridApi | null = null;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;

    constructor(
        private ngZone: NgZone,
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
        // subscribe to the requestStatus of the search
        // will indicate if the current state of the search
        this.termSearchService.requestStatusSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((newStatus: RequestStatus) => {
                this.currentRequestStatus = newStatus;
            },
            (error: any) => {
                throw error;
            });
        //
        this.subscribeToDataSource();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private subscribeToDataSource(): void {
        if(!this.dataSource) {
            throw new Error('Invalid data source');
        }
        this.dataSource
        .subscribe((results: IBedesSearchResultOutput) => {
            this.searchResults = results.results;
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
        })
    }

    /**
     * Navigate to the bedesTerm details view for the selected term.
     */
    public viewTerm(selectedItem: ISearchResultRow): void {
        if ( selectedItem.ref.resultObjectType === SearchResultType.BedesTerm
            || selectedItem.ref.resultObjectType === SearchResultType.BedesConstrainedList
        ) {
            if (selectedItem.ref.uuid) {
                this.router.navigate(['/bedes-term', selectedItem.ref.uuid]);
            }
            else if (selectedItem.ref.id) {
                this.router.navigate(['/bedes-term', selectedItem.ref.id]);
            }
            else {
            }
        }
        else if (selectedItem.ref.resultObjectType === SearchResultType.BedesTermOption) {
            // navigate to bedes-term/term_uuid_or_id/edit/option_uuid_or_id
            const termId = selectedItem.ref.termUUID || selectedItem.ref.termId;
            // weird bug... navigating using the commented out code below doesn't work
            // sometimes it pops up with an 'Navigation triggered outside Angular zone' error
            // and view doesn't display correctly. Found this workaround:
            // https://stackoverflow.com/questions/53133544/angular-7-routerlink-directive-warning-navigation-triggered-outside-angular-zon
            this.ngZone.run(() => this.router.navigate(['/bedes-term', termId])).then();
            // this.router.navigate(['/bedes-term', termId]);
        }
        else if (selectedItem.ref.resultObjectType === SearchResultType.CompositeTerm) {
            const termId = selectedItem.ref.uuid || selectedItem.ref.termId;
            this.router.navigate(['/composite-term/edit', termId]);
        }
        else {
        }
    }

    /**
     * Setup the ag-grid for the list of projects.
     */
    private gridSetup(): void {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                sortable: true,
                resizable: true,
                filter: true,
                cellStyle: {
                    height: '100%',
                }
            },
            enableRangeSelection: true,
            columnDefs: this.buildColumnDefs(),
            onGridReady: (event: GridReadyEvent) => {
                this.gridInitialized = true;
                this.gridApi = event.api;
                
                if (this.gridOptions && this.gridApi && this.searchResults && !this.initialized) {
                    this.setGridData();
                }
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
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
                cellRenderer: TableCellTermNameComponent,
                cellStyle: {
                }
            },
            {
                headerName: 'Term Type',
                field: 'searchResultTypeName',
            },
            {
                headerName: 'Data Type',
                field: 'dataTypeName'
            },
            {
                headerName: 'Owner',
                field: 'ownerName'
            },
            {
                headerName: 'Sharing',
                field: 'scopeName'
            }
        ];
    }

    private setGridData() {
        if (this.gridOptions && this.gridApi && this.searchResults && this.gridInitialized) {
            const gridData = this.searchResults.map((searchResult: BedesSearchResult) => {
                // set the scope name
                let scopeName: string | undefined | null;
                if (searchResult.scopeId) {
                    const scopeObj = scopeList.getItemById(searchResult.scopeId);
                    scopeName = scopeObj.name;
                }
                else if (searchResult.resultObjectType !== SearchResultType.CompositeTerm) {
                    scopeName = 'Approved';
                }
                // set the data type
                let dataTypeName: string | undefined;
                if (searchResult.resultObjectType === SearchResultType.BedesTermOption) {
                    dataTypeName = 'Constrained List Option';
                }
                else if (searchResult.resultObjectType === SearchResultType.CompositeTerm) {
                    if (searchResult.dataTypeId) {
                        dataTypeName = this.supportListService.transformIdToName(SupportListType.BedesDataType, searchResult.dataTypeId)
                    } else {
                        dataTypeName = 'Composite Term';
                    }
                }
                else {
                    dataTypeName = this.supportListService.transformIdToName(SupportListType.BedesDataType, searchResult.dataTypeId)
                }
                // set the term name
                const termName = searchResult.resultObjectType === SearchResultType.BedesTermOption && searchResult.termListName
                    ? `${searchResult.termListName}::${searchResult.name}`
                    : searchResult.name;

                return <ISearchResultRow>{
                    name: termName,
                    uuid: searchResult.uuid,
                    categoryName: this.supportListService.transformIdToName(SupportListType.BedesCategory, searchResult.termCategoryId),
                    // dataTypeName: this.supportListService.transformIdToName(SupportListType.BedesDataType, searchResult.dataTypeId),
                    unitName: this.supportListService.transformIdToName(SupportListType.BedesUnit, searchResult.unitId),
                    ref: searchResult,
                    searchResultTypeName: getResultTypeName(searchResult.resultObjectType),
                    dataTypeName: dataTypeName,
                    scopeName: scopeName,
                    ownerName: searchResult.resultObjectType === SearchResultType.CompositeTerm
                        ? searchResult.ownerName
                        : 'BEDES'
                }
            });
            // this.gridOptions.api.setRowData(gridData);
            this.gridApi.updateGridOptions({rowData: gridData});
            this.gridData = gridData;
            this.initialized = true;
        }
    }

}
