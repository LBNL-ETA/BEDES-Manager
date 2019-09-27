import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RequestStatus } from '../../../enums';
import { Router } from '@angular/router';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions, ColDef, SelectionChangedEvent } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { BedesTermSelectorService } from '../../../services/bedes-term-selector/bedes-term-selector.service';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';
import { ISearchResultRow } from '../../../models/ag-grid/search-result-row.interface';
import { SupportListType } from '../../../services/support-list/support-list-type.enum';
import { TableCellTermNameComponent } from '../../bedes-term-search/bedes-search-results-table/table-cell-term-name/table-cell-term-name.component';
import { getResultTypeName } from '../../../lib/get-result-type-name';
import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';

@Component({
    selector: 'app-select-terms-table',
    templateUrl: './select-terms-table.component.html',
    styleUrls: ['./select-terms-table.component.scss']
})
export class SelectTermsTableComponent implements OnInit, OnDestroy {
    public RequestStatus = RequestStatus;
    public currentRequestStatus: RequestStatus;
    public searchResults = new Array<BedesSearchResult>();
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public hasSearched = false;
    private receivedInitialValues = false;
    @ViewChild('agGrid') agGrid: AgGridNg2;
    // grid options
    public gridOptions: GridOptions;
    private gridInitialized = false;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    // lists
    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;
    // search results
    public selectedTerms: Array<ISearchResultRow>;

    constructor(
        private router: Router,
        private termSearchService: BedesTermSearchService,
        private termService: BedesTermService,
        private supportListService: SupportListService,
        private termSelectorService: BedesTermSelectorService
    ) { }

    ngOnInit() {
        this.initializeSupportLists();
        this.initializeGrid();
        this.initializeSearchResultsSubscriber();
        this.initializeSearchStatusSubscriber();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Setup the lists that translates id's into text labels.
     */
    private initializeSupportLists(): void {
        this.supportListService.unitListSubject.subscribe(
            (results: Array<BedesUnit>) => {
                this.unitList = results;
            }
        );
        this.supportListService.dataTypeSubject.subscribe(
            (results: Array<BedesDataType>) => {
                this.dataTypeList = results;
            }
        );
        this.supportListService.termCategorySubject.subscribe(
            (results: Array<BedesTermCategory>) => {
                this.categoryList = results;
            }
        );
    }

    /**
     * Setup the ag-grid.
     */
    private initializeGrid(): void {
        this.gridOptions = <GridOptions>{
            enableRangeSelection: true,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            rowSelection: 'multiple',
            suppressRowClickSelection: true,
            // suppressCellSelection: true,
            columnDefs: this.buildColumnDefs(),
            // getRowNodeId: (data: any) => {
            //     return data.id;
            // },
            onGridReady: () => {
                this.gridInitialized = true;
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                this.selectedTerms = event.api.getSelectedRows();
            }
        };
    }


    /**
     * Calls the service to update the selected terms for the current composite term.
     */
    public updateSelectedTerms(): void {
        // this.termSelectorService.setSelectedTerms(this.selectedTerms);
    }

    /**
     * Removes the selection from selected terms.
     * Removes all items from the selectedTerms and updates
     * the grid to remove all row selections.
     */
    public resetSelectedTerms(): void {
        // remove all items from the selectedTerms array
        this.selectedTerms.splice(0, this.selectTerms.length)
        // deSelect the grid rows
        this.gridOptions.api.deselectAll();
    }

    /**
     * Subscribe to the BedesSearchResults Subject.
     */
    private initializeSearchResultsSubscriber(): void {
        // subscribe to the search results service
        this.termSearchService.searchResultsSubject()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesSearchResult>) => {
                // TODO: this needs to return bedes terms and options only, not composite terms
                this.searchResults = results;
                if (this.gridOptions.api) {
                    // this.gridOptions.api.setRowData(this.buildGridData());
                    this.setGridData();
                }
                if(!this.receivedInitialValues) {
                    this.receivedInitialValues = true;
                }
                else {
                    this.hasSearched = true;
                }
            },
            (error: any) => {
                throw error;
            });
    }

    private initializeSearchStatusSubscriber(): void {
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

    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'name',
                minWidth: 250,
                checkboxSelection: true
            },
            {
                headerName: 'Type',
                field: 'searchResultTypeName'
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

    /**
     * Build the data for populating the grid.
     */
    private setGridData(): void {
        if (this.gridOptions && this.gridOptions.api && this.searchResults && this.gridInitialized) {
            // remove existing composite terms
            const filteredData = this.searchResults.filter((d) => d.resultObjectType !== SearchResultType.CompositeTerm);
            const gridData = filteredData.map((searchResult: BedesSearchResult) => {
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
            this.gridOptions.api.setRowData(gridData);
        }
    }


    /**
     * Retrieves the selected BedesTerms in the grid from the api
     */
    public selectTerms(): void {
        // extract the ids from the selected ISearchResultRow objects.
        const ids = this.selectedTerms.map((d) => d.ref.id);
        // call the api to retrieve the term objects
        this.termService.getTerms(ids)
        .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
            // update the selected terms service with the new terms
            this.termSelectorService.setSelectedTerms(results);
            this.resetSelectedTerms();
        });
    }

}
