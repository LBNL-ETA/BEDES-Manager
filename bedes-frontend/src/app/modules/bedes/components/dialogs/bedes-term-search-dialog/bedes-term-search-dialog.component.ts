import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GridOptions, SelectionChangedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { ISearchResultRow } from '../../../models/ag-grid/search-result-row.interface';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { SupportListType } from '../../../services/support-list/support-list-type.enum';
import { getResultTypeName } from '../../../lib/get-result-type-name';
import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';
import { ISearchDialogOptions } from './search-dialog-options.interface';
import { scopeList } from '@bedes-common/lookup-tables/scope-list';

@Component({
    selector: 'app-bedes-term-search-dialog',
    templateUrl: './bedes-term-search-dialog.component.html',
    styleUrls: ['./bedes-term-search-dialog.component.scss']
})
export class BedesTermSearchDialogComponent implements OnInit {
    public searchString: string;
    public showPublicTerms = false;
    public waitingForResults = false;
    public searchResults = new Array<BedesSearchResult>();
    public selectedItems: Array<ISearchResultRow>;
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
    public gridData = new Array<ISearchResultRow>();
    public tableContext: any;

    constructor(
        public dialogRef: MatDialogRef<BedesTermSearchDialogComponent>,
        private bedesTermSearchService: BedesTermSearchService,
        private supportListService: SupportListService,
        @Inject(MAT_DIALOG_DATA) public dialogOptions: ISearchDialogOptions) { }

    ngOnInit() {
        this.resetData();
        this.setDialogOptions();
        this.gridSetup();
        this.setTableContext();
    }

    private resetData(): void {
        this.numResults = 0;
        this.searchResults = [];
        this.gridDataNeedsRefresh = true;
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
        if (this.dialogOptions
            && Array.isArray(this.dialogOptions.excludeResultType)
            && this.dialogOptions.excludeResultType.length > 0
        ) {
            this.excludedResultType = this.dialogOptions.excludeResultType;
        }
    }

    /**
     * Set's the array of uuid strings to exclude from the results set.
     */
    private setExcludeUUID(): void {
        if (this.dialogOptions
            && Array.isArray(this.dialogOptions.excludeUUID)
            && this.dialogOptions.excludeUUID.length
        ) {
            this.excludeUUID = this.dialogOptions.excludeUUID;
        }
    }

    /**
     * Set's the indicator for displaying only objects with uuids.
     */
    private setShowOnlyUUID(): void {
        if (this.dialogOptions && this.dialogOptions.showOnlyUUID) {
            this.showOnlyUUID = true;
        }
    }

    /**
     * Closes the dialog.
     */
    public close(): void {
        this.dialogRef.close();
    }

    public showPublicTermsChange(event) {
        this.showPublicTerms = event.checked;
        this.searchForTerms();
    }

    /**
     * Call the backend api and run the search.
     */
    public searchForTerms(): void {
        this.waitingForResults = true;
        this.bedesTermSearchService.searchAndNotify([this.searchString], this.showPublicTerms)
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
    public importSelectedTerms(): void {
        if (!this.selectedItems || !this.selectedItems.length) {
            throw new Error(`${this.constructor.name}: importSelectedTerms expected to have valid selectedItems, none found`);
        }
        this.dialogRef.close(this.selectedItems.map((item) => item.ref));
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
            onGridReady: (event: GridReadyEvent) => {
                this.gridInitialized = true;
                if (this.gridDataNeedsRefresh) {
                    this.setGridData();
                }
                else {
                    event.api.setRowData([]);
                }
                event.api.checkGridSize();
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                this.selectedItems = event.api.getSelectedRows();
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
                headerName: 'Term Type',
                field: 'searchResultTypeName'
            },
            // {
            //     headerName: 'Category',
            //     field: 'categoryName'
            // },
            // {
            //     headerName: 'Unit',
            //     field: 'unitName'
            // },
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
                    let scopeName: string | undefined | null;
                    if (searchResult.scopeId) {
                        const scopeObj = scopeList.getItemById(searchResult.scopeId);
                        scopeName = scopeObj.name;
                    }
                    else if (searchResult.resultObjectType !== SearchResultType.CompositeTerm) {
                        scopeName = 'Approved';
                    }
                    let dataTypeName: string | undefined;
                    if (searchResult.resultObjectType === SearchResultType.BedesTermOption) {
                        dataTypeName = 'Constrained List Option';
                    }
                    else if (searchResult.resultObjectType === SearchResultType.CompositeTerm) {
                        dataTypeName = 'Composite Term';
                    }
                    else {
                        dataTypeName = this.supportListService.transformIdToName(SupportListType.BedesDataType, searchResult.dataTypeId)
                    }
                    // set the term name
                    const termName = searchResult.resultObjectType === SearchResultType.BedesTermOption && searchResult.termListName
                        ? `${searchResult.termListName}::${searchResult.name}`
                        : searchResult.name;
                    gridData.push(<ISearchResultRow>{
                        name: termName,
                        uuid: searchResult.uuid,
                        unitName: this.supportListService.transformIdToName(SupportListType.BedesUnit, searchResult.unitId),
                        ref: searchResult,
                        searchResultTypeName: getResultTypeName(searchResult.resultObjectType),
                        categoryName: this.supportListService.transformIdToName(SupportListType.BedesCategory, searchResult.termCategoryId),
                        dataTypeName: dataTypeName,
                        scopeName: scopeName,
                        ownerName: searchResult.resultObjectType === SearchResultType.CompositeTerm
                            ? searchResult.ownerName
                            : 'BEDES'
                    });
                }
            });
            this.gridOptions.api.setRowData(gridData);
            this.gridData = gridData;
            this.gridDataNeedsRefresh = false;
        }
    }

}
