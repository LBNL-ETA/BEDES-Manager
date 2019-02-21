import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { CompositeTermService } from '../../../services/composite-term/composite-term.service';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { BedesCompositeTermShort } from '@bedes-common/models/bedes-composite-term-short/bedes-composite-term-short';
import { MessageFromGrid } from '../../../models/ag-grid/message-from-grid';
import { TableCellMessageType } from '../../../models/ag-grid/enums/table-cell-message-type.enum';
import { TableCellNavComponent } from '../../../models/ag-grid/table-cell-nav/table-cell-nav.component';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

interface IGridRow {
    name: string;
    scope: string;
    ref: BedesCompositeTermShort;
}

@Component({
    selector: 'app-composite-term-list',
    templateUrl: './composite-term-list.component.html',
    styleUrls: ['./composite-term-list.component.scss']
})
export class CompositeTermListComponent extends MessageFromGrid<IGridRow> implements OnInit {
    /* Array that holds the list of CompositeTerms */
    public termList: Array<BedesCompositeTermShort>;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: Array<IGridRow>;
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

    /**
     * Override the abstract class MessageFromGrid.
     *
     * Process the messages from the ag-grid AppTerm list.
     */
    public messageFromGrid(messageType: TableCellMessageType, selectedRow: IGridRow): void {
        this.selectedItem = selectedRow;
        if (messageType === TableCellMessageType.View) {
            // view the composite term
            this.viewSelectedItem(selectedRow.ref);
        }
        else if (messageType === TableCellMessageType.Remove) {
            // show the term removal confirmation dialog
            this.confirmRemoveSelectedItem(selectedRow.ref);
        }
    }

    /**
     * Confirm the removal of an AppTerm before calling the backend API.
     */
    private confirmRemoveSelectedItem(term: BedesCompositeTermShort): void {
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
            console.log('dialogRef.afterClosed()', results);
            if (results) {
                this.removeSelectedItem(term);
            }
        });
    }

    /**
     * Remove the composite term that's currently selected in the table.
     */
    private removeSelectedItem(term: BedesCompositeTermShort): void {
        // get the reference to the selected AppTerm, if there is one
        if (term) {
            // remove the term
            this.compositeTermService.deleteTerm(term)
            .subscribe((results: number) => {
                console.log(`${this.constructor.name}: delete appTerm success`, results);
            }, (error: any) => {
                console.log('An error occurred removing AppTerm', error);
            });
        }
        else {
            throw new Error('removeSelectedItem expected a valid AppTerm and id');
        }
    }


    /**
     * Subscribe to the composite term list BehaviorSubject.
     */
    private subscribeToTermList(): void {
        this.compositeTermService.termListSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
            (termList: Array<BedesCompositeTermShort>) => {
                this.termList = termList;
                this.gridDataNeedsSet = true;
                this.setGridData();
            }
        )
    }

    /**
     * Subscribe to the UserStatus Observable
     */
    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                console.log(`${this.constructor.name}: received user status`, currentUser);
                this.currentUser = currentUser;
                this.isEditable = currentUser.isLoggedIn();
            });
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
            // rowSelection: 'multiple',
            columnDefs: this.buildColumnDefs(),
            onGridReady: () => {
                this.gridInitialized = true;
                if (this.gridOptions && this.gridOptions.api) {
                    this.setGridData();
                }
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                console.log('selection changed', event.api.getSelectedRows());
                const rows = event.api.getSelectedRows();
                this.selectedItem = rows && rows.length ? rows[0] : undefined;
            }
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
                // checkboxSelection: true,
                // minWidth: 250,
                cellRendererFramework: TableCellNavComponent
            },
            {
                headerName: 'Description',
                field: 'ref.description'
            },
            {
                headerName: 'Scope',
                field: 'scopeName'
            }
        ];
    }

    /**
     * Populates the grid with the data from the applicationList.
     */
    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsSet && this.gridOptions.api) {
            const gridData = new Array<IGridRow>();
            if (Array.isArray(this.termList)) {
                this.termList.forEach((item: BedesCompositeTermShort) => {
                    gridData.push(<IGridRow>{
                        name: item.name,
                        ref: item
                    });
                })
            }
            this.gridOptions.api.setRowData(gridData);
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
