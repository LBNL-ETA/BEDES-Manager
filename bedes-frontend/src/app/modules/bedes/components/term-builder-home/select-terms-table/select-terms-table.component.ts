import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RequestStatus } from '../../../enums';
import { Router } from '@angular/router';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions, ColDef, ValueGetterParams, SelectionChangedEvent } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { BedesTermSelectorService } from '../../../services/bedes-term-selector/bedes-term-selector.service';

@Component({
    selector: 'app-select-terms-table',
    templateUrl: './select-terms-table.component.html',
    styleUrls: ['./select-terms-table.component.scss']
})
export class SelectTermsTableComponent implements OnInit, OnDestroy {
    public RequestStatus = RequestStatus;
    public currentRequestStatus: RequestStatus;
    public searchResults = new Array<BedesTerm | BedesConstrainedList>();
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public hasSearched = false;
    private receivedInitialValues = false;
    @ViewChild('agGrid') agGrid: AgGridNg2;
    // grid options
    public gridOptions: GridOptions;
    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;
    public selectedTerms: Array<BedesTerm | BedesConstrainedList>;

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
            getRowNodeId: (data: any) => {
                return data.id;
            },
            onGridReady: () => {
                // this.initialRowDataLoad$.subscribe(
                //     rowData => {
                //         // the initial full set of data
                //         // note that we don't need to un-subscribe here as it's a one off data load
                //         if (this.gridOptions.api) { // can be null when tabbing between the examples
                //             this.gridOptions.api.setRowData(rowData);
                //         }

                //         // now listen for updates
                //         // we process the updates with a transaction - this ensures that only the changes
                //         // rows will get re-rendered, improving performance
                //         this.rowDataUpdates$.subscribe((updates) => {
                //             if (this.gridOptions.api) { // can be null when tabbing between the examples
                //                 this.gridOptions.api.updateRowData({update: updates})
                //             }
                //         });
                //     }
                // );
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                console.log('selection changed', event.api.getSelectedRows());
                this.termSelectorService.setSelectedTerms(event.api.getSelectedRows());
                this.selectedTerms = event.api.getSelectedRows();
            }
        };
    }

    private initializeSearchResultsSubscriber(): void {
        // subscribe to the search results service
        this.termSearchService.searchResultsSubject()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
                console.log(`${this.constructor.name}: received search results...`, results);
                this.searchResults = results;
                if (this.gridOptions.api) {
                    this.gridOptions.api.setRowData(results);
                }
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
    }

    private initializeSearchStatusSubscriber(): void {
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

    // getSelectedRows() {
    //     const selectedNodes = this.agGrid.api.getSelectedNodes();
    //     const selectedData = selectedNodes.map( node => node.data );
    //     const selectedDataStringPresentation = selectedData.map( node => node.make + ' ' + node.model).join(', ');
    //     alert(`Selected nodes: ${selectedDataStringPresentation}`);
    // }

    private buildColumnDefs(): Array<ColDef> {
        return [
            {headerName: 'Name', field: 'name', checkboxSelection: true },
            {headerName: 'Description', field: 'description'},
            {
                headerName: 'Term Category',
                field: 'termCategoryId',
                valueGetter: (params: ValueGetterParams) => {
                    if (this.categoryList) {
                        const item = this.categoryList.find((d) => d.id === params.data.termCategoryId);
                        if (item) {
                            return item.name;
                        }
                    }
                }
            },
            {headerName: 'Data Type', field: 'dataTypeId'},
            {
                headerName: 'Unit',
                field: 'unitId',
                valueGetter: (params: ValueGetterParams) => {
                    if (this.unitList) {
                        const unit = this.unitList.find((d) => d.id === params.data.unitId);
                        if (unit) {
                            return unit.name;
                        }
                    }
                    return ``;
                }
            },
        ]
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

    /**
     * Sets the selected BedesTerms
     */
    public selectTerms(): void {
        this.termSelectorService.setSelectedTerms(this.selectedTerms);
    }

}
