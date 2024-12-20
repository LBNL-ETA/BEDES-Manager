import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ColDef, GridApi, GridOptions, GridReadyEvent, SelectionChangedEvent} from 'ag-grid-community';
import {CompositeTermService} from '../../../services/composite-term/composite-term.service';
import {AuthService} from 'src/app/modules/bedes-auth/services/auth/auth.service';
import {CurrentUser} from '@bedes-common/models/current-user/current-user';
import {BedesCompositeTermShort} from '@bedes-common/models/bedes-composite-term-short/bedes-composite-term-short';
import {MessageFromGrid} from '../../../models/ag-grid/message-from-grid';
import {TableCellMessageType} from '../../../models/ag-grid/enums/table-cell-message-type.enum';
import {TableCellNavComponent} from '../../../models/ag-grid/table-cell-nav/table-cell-nav.component';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {ConfirmDialogComponent} from '../../dialogs/confirm-dialog/confirm-dialog.component';
import {scopeList} from '@bedes-common/lookup-tables/scope-list';
import {TableCellDeleteComponent} from '../../../models/ag-grid/table-cell-delete/table-cell-delete.component';

/** css formatting applied to console log statements */
const consoleFormatString = 'background-color:green; color: white; padding: 5px;';

interface IGridRow {
    name: string;
    scope: string;
    ref: BedesCompositeTermShort;
    isEditable: boolean;
    scopeName: string;
}

@Component({
    selector: 'app-composite-term-list',
    templateUrl: './composite-term-list.component.html',
    styleUrls: ['./composite-term-list.component.scss']
})
export class CompositeTermListComponent extends MessageFromGrid<IGridRow> implements OnInit, OnDestroy {
    public get compositeTermServiceRef() {
        return this.compositeTermService;
    }
    /* Array that holds the list of CompositeTerms */
    public termList: Array<BedesCompositeTermShort>;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: IGridRow[];
    /** API object for the ag-grid component */
    private gridApi: GridApi | undefined;
    public tableContext: any;
    // Indicates if the grid has been initialized.
    private gridInitialized = false;
    // Indicates if the grid's data needs to be set
    private gridDataNeedsSet = false;
    // The current selected row
    private selectedItem: IGridRow | undefined;
    /* The current user */
    public currentUser: CurrentUser;
    // Indicates if the CompositeTerms are editable
    public isEditable = false;
    public hasError = false;
    public errorMessage: string;
    public search: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private compositeTermService: CompositeTermService,
        private authService: AuthService,
        private dialog: MatDialog
    ) {
        super();
    }

    ngOnInit() {
        this.subscribeToUserStatus();
        this.subscribeToTermList();
        this.gridSetup();
        this.setTableContext();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public deleteMultiple(): void {
        if (this.rowData && this.rowData.length) {
            this.messageFromGrid(TableCellMessageType.removeAll, null);
        }
    }

    /**
     * Override the abstract class MessageFromGrid.
     *
     * Process the messages from the ag-grid AppTerm list.
     */
    public messageFromGrid(messageType: TableCellMessageType, selectedRow: IGridRow): void {
        this.selectedItem = selectedRow ? selectedRow : null;
        if (messageType === TableCellMessageType.View) {
            if (!this.selectedItem) {
                return;
            }
            // view the composite term
            this.viewSelectedItem(this.selectedItem.ref);
        } else if (messageType === TableCellMessageType.Remove) {
            if (!this.selectedItem) {
                return;
            }
            // show the term removal confirmation dialog
            this.confirmRemoveSelectedItem([this.selectedItem.ref]);
        } else if (messageType === TableCellMessageType.removeAll) {
            if (!this.rowData) {
                return;
            }
            const selectedTerms: BedesCompositeTermShort[] = [];
            for (const row of this.rowData) {
                selectedTerms.push(row.ref);
            }
            // show the term removal confirmation dialog
            this.confirmRemoveSelectedItem(selectedTerms);
        }
    }

    /**
     * Confirm the removal of an AppTerm before calling the backend API.
     */
    private confirmRemoveSelectedItem(terms: BedesCompositeTermShort[]): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '450px',
            position: {top: '20px'},
            data: {
                dialogTitle: 'Confirm?',
                dialogContent: 'Remove the selected terms?',
            }
        });
        dialogRef.afterClosed().subscribe((results: boolean) => {
            if (results) {
                this.removeSelectedItem(terms);
            }
        });
    }

    /**
     * Remove the composite terms that are currently selected in the table.
     */
    private removeSelectedItem(terms: BedesCompositeTermShort[]): void {
        for (const term of terms) {
            // get the reference to the selected AppTerm, if there is one
            if (term) {
                // remove the terms
                this.compositeTermService.deleteTerm(term)
                    .subscribe((results: number) => {
                    }, (error: any) => {
                    });
            } else {
                throw new Error('removeSelectedItem expected a valid AppTerm and id');
            }
        }
    }


    /**
     * Subscribe to the composite term list BehaviorSubject.
     */
    private subscribeToTermList(): void {
        this.compositeTermService.termListSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((termList: Array<BedesCompositeTermShort>) => {
            this.termList = termList;
            this.gridDataNeedsSet = true;
            this.setGridData();
        })
    }

    /**
     * Subscribe to the UserStatus Observable
     */
    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                this.currentUser = currentUser;
                this.isEditable = currentUser.isLoggedIn();
            });
    }

    /**
     * Links the keyboard events to the grid's quickfilter api
     * @param event
     */
    public quickFilterChange(event: any): void {
        if (this.gridApi) {
            this.gridApi.setQuickFilter(event.target.value);
        }
    }

    public showPublicChange(event: any): void {
        this.compositeTermService.includePublicTerms = event.checked;
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
            rowSelection: 'multiple',
            onGridReady: (event: GridReadyEvent) => {
                this.gridApi = event.api;
                this.gridInitialized = true;
                if (this.gridOptions && this.gridApi) {
                    this.setGridData();
                }
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                const rows = event.api.getSelectedRows();
                this.selectedItem = rows && rows.length === 1 ? rows[0] : undefined;
                this.rowData = rows;
            },
            isRowSelectable: (rowNode) => rowNode.data?.isEditable === true
        };
    }

    /**
     * Builds the column definitions for the list of projects.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'ref.name',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                cellRenderer: TableCellNavComponent,
                cellStyle: {
                }
            },
            {
                headerName: 'Owner',
                field: 'ref.ownerName'
            },
            {
                headerName: 'Sharing',
                field: 'scopeName'
            },
            {
                headerName: '',
                width: 50,
                cellRenderer: TableCellDeleteComponent,
                cellStyle: {
                    top: '9%',
                }
            },
        ];
    }

    /**
     * Populates the grid with the data from the applicationList.
     */
    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsSet && this.gridApi) {
            const gridData = new Array<IGridRow>();
            if (Array.isArray(this.termList)) {
                this.termList.forEach((item: BedesCompositeTermShort) => {
                    const scopeObj = scopeList.getItemById(item.scopeId);
                    gridData.push(<IGridRow>{
                        name: item.name,
                        isEditable: this.currentUser.canEditCompositeTerm(item),
                        ref: item,
                        scopeName: scopeObj.name,
                    });
                })
            }
            // this.gridOptions.api.setRowData(gridData);
            this.gridApi.updateGridOptions({rowData: gridData});
            this.gridDataNeedsSet = false;
        }
    }

    /**
     * View the selected CompositeTerm, which is set from the grid configuration.
     */
    public viewSelectedItem(term: BedesCompositeTermShort): void {
        // navigate to the route
        this.router.navigate(['../edit', term.uuid], { relativeTo: this.route});
    }

}
