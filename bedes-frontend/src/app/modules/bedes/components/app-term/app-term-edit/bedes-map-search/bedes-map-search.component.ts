import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { BedesTermSearchService } from '../../../../services/bedes-term-search/bedes-term-search.service';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { ISearchResultRow } from '../../../../models/ag-table/search-result-row.interface';
import { SupportListService } from '../../../../services/support-list/support-list.service';
import { SupportListType } from '../../../../services/support-list/support-list-type.enum';
import { getResultTypeName } from '../../../../lib/get-result-type-name';
import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';
import { takeUntil } from 'rxjs/operators';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { AppTermService } from '../../../../services/app-term/app-term.service';
import { Subject } from 'rxjs';
import { TermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite';
import { ITermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite.interface';
import { BedesTermService } from '../../../../services/bedes-term/bedes-term.service';
import { CompositeTermService } from 'src/app/modules/bedes/services/composite-term/composite-term.service';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { ITermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic.interface';
import { TermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic';

@Component({
  selector: 'app-bedes-map-search',
  templateUrl: './bedes-map-search.component.html',
  styleUrls: ['./bedes-map-search.component.scss']
})
export class BedesMapSearchComponent implements OnInit {
    public searchString: string;
    public waitingForResults = false;;
    public searchResults = new Array<BedesSearchResult>();
    public selectedItem: ISearchResultRow;
    public appTerm: AppTerm;
    public numResults = 0;
    // result filtering options
    // Array of SearchResultTypes to exclude from the search result.
    private excludedResultType = new Array<SearchResultType>();
    // indicates if the grid should only show objects with uuids
    private showOnlyUUID = false;
    // holds uuids of objects to exclude from the result set
    private excludeUUID = new Array<string>();
    // ag-grid
    private gridInitialized = false;
    private gridDataNeedsRefresh = false;
    public gridOptions: GridOptions;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    @Output()
    backEvent = new EventEmitter<any>();

    constructor(
        private bedesTermSearchService: BedesTermSearchService,
        private supportListService: SupportListService,
        private appTermService: AppTermService,
        private termService: BedesTermService,
        private compositeTermService: CompositeTermService
    ) { }

    ngOnInit() {
        this.setDialogOptions();
        this.gridSetup();
        this.setTableContext();
    }

    /**
     * Set the options for the data in this grid.
     */
    private setDialogOptions(): void {
        this.setExculdeResultType();
        this.setExcludeUUID();
        this.setShowOnlyUUID();
    }

    /**
     * Set's the array of SearchResultType objects to exclude from the result set.
     */
    private setExculdeResultType(): void {
    }

    /**
     * Set's the array of uuid strings to exclude from the results set.
     */
    private setExcludeUUID(): void {
    }

    /**
     * Set's the indicator for displaying only objects with uuids.
     */
    private setShowOnlyUUID(): void {
        this.showOnlyUUID = true;
    }

    /**
     * Subscribe to the BehaviorSubject that serves the
     * active Mapping Application's set of AppTerms.
     */
    private subscribeToActiveTerm(): void {
        console.log('subscribe to the active AppTerm')
        this.appTermService.activeTermSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((activeTerm: AppTerm | undefined) => {
                this.appTerm = activeTerm;
            });
    }

    public back(): void {
        this.backEvent.emit();
    }

    /**
     * Call the backend api and run the search.
     */
    public searchForTerms(): void {
        this.waitingForResults = true;
        this.bedesTermSearchService.searchAndNotify([this.searchString])
            .subscribe((results: Array<BedesSearchResult>) => {
                // set the number of rows found
                this.numResults = results.length;
                this.searchResults = results;
                this.gridDataNeedsRefresh = true;
                this.setGridData();
            }, (error: any) => {
                this.numResults = 0;
            }, () => {
                this.waitingForResults = false;
            });
    }

    /**
     * Import the selected BedesTerms.
     */
    public importSelectedTerm(): void {
        if (!this.selectedItem) {
            throw new Error(`${this.constructor.name}: no selected term found`);
        }
        console.log('map the term', this.selectedItem);
        const item = this.selectedItem.ref;
        if(item.resultObjectType === SearchResultType.CompositeTerm) {
            this.compositeTermService.getTerm(item.id)
            .subscribe((compositeTerm: BedesCompositeTerm) => {
                const params: ITermMappingComposite = {
                    _id: undefined,
                    _appListOption: undefined,
                    _compositeTerm: compositeTerm.toInterface()
                }
                this.appTerm.mapping = new TermMappingComposite(params);
                this.back();
            })
        }
        else {
            this.termService.getTerm(item.uuid)
            .subscribe((term: BedesTerm | BedesConstrainedList) => {
                const params: ITermMappingAtomic = {
                    _id: undefined,
                    _appListOption: undefined,
                    _bedesTerm: term.toInterface()
                }
                this.appTerm.mapping = new TermMappingAtomic(params);
                this.back();

            });
        }
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
            rowSelection: 'single',
            columnDefs: this.buildColumnDefs(),
            // getRowNodeId: (data: any) => {
            //     return data.uuid;
            // },
            onGridReady: () => {
                this.gridInitialized = true;
                if (this.gridDataNeedsRefresh) {
                    this.setGridData();
                }
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                const rows = event.api.getSelectedRows();
                if (rows.length) {
                    this.selectedItem = rows[0];
                }
                else {
                    this.selectedItem = undefined;
                }
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
                checkboxSelection: true
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
        if (this.gridInitialized && this.gridDataNeedsRefresh) {
            const gridData = new Array<ISearchResultRow>();
            const validResultType = (resultObjectType: SearchResultType) => {
                return this.excludedResultType.find((item) => item == resultObjectType)
                    ? false
                    : true;
            }
            const validUUID = (uuid: string) => {
                if (!uuid && !this.showOnlyUUID) {
                    // no uuid passed in and no restriction on showing only uuid
                    return true;
                }
                else if (!uuid && this.showOnlyUUID) {
                    return false;
                }
                else if (uuid && !this.excludeUUID.find((item) => item === uuid)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            this.searchResults.forEach((searchResult: BedesSearchResult) => {
                if (validResultType(searchResult.resultObjectType) && validUUID(searchResult.uuid)) {
                    gridData.push(<ISearchResultRow>{
                        name: searchResult.name,
                        uuid: searchResult.uuid,
                        unitName: this.supportListService.transformIdToName(SupportListType.BedesUnit, searchResult.unitId),
                        ref: searchResult,
                        searchResultTypeName: getResultTypeName(searchResult.resultObjectType)
                    });
                }
            });
            this.gridOptions.api.setRowData(gridData);
            this.gridDataNeedsRefresh = true;
        }
    }

}
