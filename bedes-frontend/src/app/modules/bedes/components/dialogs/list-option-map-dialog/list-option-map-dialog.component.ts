import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { IListOptionMapDialogData } from './list-option-map-dialog-data.interface';
import { BedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option';

@Component({
    selector: 'app-list-option-map-dialog',
    templateUrl: './list-option-map-dialog.component.html',
    styleUrls: ['./list-option-map-dialog.component.scss']
})
export class ListOptionMapDialogComponent implements OnInit {
    public term: BedesConstrainedList;
    private excludeOptions: Array<BedesTermOption>;
    public selectedOption: BedesTermOption;
    // ag-grid
    private gridInitialized = false;
    private gridDataNeedsRefresh = false;
    public gridOptions: GridOptions;
    public rowData: Array<BedesTermOption>;
    public tableContext: any;

    constructor(
        public dialogRef: MatDialogRef<ListOptionMapDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data: IListOptionMapDialogData) {
            if (data) {
                this.term = data.constrainedList;
                this.excludeOptions = data.excludeOptions;
            }
        }

    ngOnInit() {
        this.gridDataNeedsRefresh = true;
        this.gridSetup();
        this.setTableContext();
        this.setGridData();
        console.log(`${this.constructor.name}: data`, this.term)
    }

    /**
     * Closes the dialog.
     */
    public close(): void {
        this.dialogRef.close();
    }

    public selectListOption(): void {
        if (!this.selectedOption) {
            throw new Error(`${this.constructor.name}: expected to have valid selected listOption, none found`);
        }
        console.log('import sel items', this.selectedOption);
        // send back the selected list option
        this.dialogRef.close(this.selectedOption);
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
                const selectedItems = event.api.getSelectedRows();
                if (selectedItems && selectedItems.length) {
                    this.selectedOption = selectedItems[0];
                }
                else {
                    this.selectedOption = undefined;
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
                // minWidth: 250,
                checkboxSelection: true
                // cellRendererFramework: TableCellTermNameComponent
            },
            {
                headerName: 'Description',
                field: 'description'
            }
        ];
    }

    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsRefresh) {
            const gridData = this.term.options.filter((item: BedesTermOption) => {
                return !this.shouldExcludeOption(item);
            });
            this.gridOptions.api.setRowData(gridData);
            this.gridDataNeedsRefresh = false;
        }
    }

    /**
     * Determines if a listOption has already been mapped.
     */
    private shouldExcludeOption(termOption: BedesTermOption): boolean {
        if (Array.isArray(this.excludeOptions) && this.excludeOptions.find((item) => item.uuid === termOption.uuid)) {
            return true;
        }
        else {
            return false;
        }
    }

}
