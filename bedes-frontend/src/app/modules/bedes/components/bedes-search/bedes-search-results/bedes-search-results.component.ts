import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';
import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';
import { ISearchResultRow } from '../../../models/ag-grid/search-result-row.interface';
import { getResultTypeName } from '../../../lib/get-result-type-name';

@Component({
  selector: 'app-bedes-search-results',
  templateUrl: './bedes-search-results.component.html',
  styleUrls: ['./bedes-search-results.component.scss']
})
export class BedesSearchResultsComponent implements OnInit {
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
    private gridApi: GridApi | null = null;
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
                throw error;
            });
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

    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
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
            const optionId = selectedItem.ref.uuid || selectedItem.ref.id;
            this.router.navigate(['/bedes-term', termId, 'edit', optionId]);
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
            },
            enableRangeSelection: true,
            rowSelection: 'multiple',
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
                // cellRendererFramework: TableCellTermNameComponent
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
        if (this.gridOptions && this.gridApi && this.searchResults && this.gridInitialized) {
            const gridData = this.searchResults.map((searchResult: BedesSearchResult) => {
                return <ISearchResultRow>{
                    name: searchResult.name,
                    uuid: searchResult.uuid,
                    // categoryName: this.supportListService.transformIdToName(SupportListType.BedesCategory, term.termCategoryId),
                    // dataTypeName: this.supportListService.transformIdToName(SupportListType.BedesDataType, term.dataTypeId),
                    unitName: this.supportListService.transformIdToName(SupportListType.BedesUnit, searchResult.unitId),
                    ref: searchResult,
                    searchResultTypeName: getResultTypeName(searchResult.resultObjectType)
                }
            });

            // this.gridOptions.api.setRowData(gridData);
            this.gridApi.updateGridOptions({rowData: gridData});
            this.initialized = true;
        }
    }

}
