import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, GridOptions, ColDef } from 'ag-grid-community';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { CompositeTermService } from '../../../services/composite-term/composite-term.service';
import { CompositeTermDetail } from '@bedes-common/models/bedes-composite-term/composite-term-item/composite-term-detail';
import { TableCellItemNameComponent } from './table-cell-item-name/table-cell-item-name.component';
import { SupportListType } from '../../../services/support-list/support-list-type.enum';
import { takeUntil } from 'rxjs/operators';
import { CurrentUser } from '@bedes-common/models/current-user';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';

// Object signature for grid row objects.
interface IGridRow {
    name: string;
    description: string | null | undefined;
    type: string | null | undefined;
    uuid: string;
    dataTypeName: string | null | undefined;
    unitName: string | null | undefined;
    termCategoryName: string | null | undefined;
    scopeName: string | null | undefined;
    ref: CompositeTermDetail;
    isEditable: boolean;
}

@Component({
    selector: 'app-selected-terms-table',
    templateUrl: './selected-terms-table.component.html',
    styleUrls: ['./selected-terms-table.component.scss']
})
export class SelectedTermsTableComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public compositeTerm: BedesCompositeTerm;
    public selectedTerms: Array<BedesTerm | BedesConstrainedList>;
    @ViewChild('agGrid')
    agGrid: AgGridAngular;
    // grid options
    public gridOptions: GridOptions;
    private gridApi: GridApi | null = null;
    public tableContext: any;
    private gridInitialized = false;
    private gridDataNeedsRefresh = false;
    public currentUser: CurrentUser;
    public isEditable = false;

    constructor(
        private supportListService: SupportListService,
        private authService: AuthService,
        private dialog: MatDialog,
        private compositeTermService: CompositeTermService
    ) { }

    ngOnInit() {
        this.initializeGrid();
        this.subscribeToUserStatus();
        this.setTableContext();
        this.subscribeToActiveTerm();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the user status Observable to get keep the user status up to date.
     */
    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                // assign the authenticated user
                this.currentUser = currentUser;
                this.refreshGridData();
            });
    }

    /**
     * Subscribe to the active composite term observable.
     */
    private subscribeToActiveTerm(): void {
        this.compositeTermService.selectedTermSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            this.compositeTerm = compositeTerm;
            this.refreshGridData();
        })
    }

    /**
     * Refreshes the grid data.
     */
    private refreshGridData(): void {
        this.gridDataNeedsRefresh = true;
        this.updateEditStatus();
        this.setGridData();
    }

    /**
     * Update the edit status of the control, ie sets
     * whether the terms can be redordered or just displayed.
     */
    private updateEditStatus(): void {
        if(this.compositeTerm
            && this.currentUser.isLoggedIn()
            && !this.compositeTerm.hasApprovedScope()
            && (
                this.compositeTerm.isNewTerm()
                || this.currentUser.canEditCompositeTerm(this.compositeTerm)
                || this.currentUser.isAdmin()
        )) {
            this.isEditable = true;
        }
        else {
            this.isEditable = false;
        }
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
     * Initialize the ag-grid.
     */
    private initializeGrid(): void {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                sortable: true,
                resizable: true,
                filter: true,
            },
            enableRangeSelection: true,
            columnDefs: this.buildColumnDefs(),
            onGridReady: (event: GridReadyEvent) => {
                this.gridApi = event.api;
                this.gridInitialized = true;

                if (this.gridDataNeedsRefresh) {
                    this.setGridData();
                }
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
        };
    }

    /**
     * Build the column definitions for the ag-grid.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'name',
                cellRenderer: TableCellItemNameComponent
            },
            {
                headerName: 'Description', field: 'description'
            },
            {
                headerName: 'Term Category',
                field: 'termCategoryName',
            },
            {
                headerName: 'Data Type',
                field: 'dataTypeName'
            },
            {
                headerName: 'Unit',
                field: 'unitName'
            },
        ]
    }

    /**
     * Remove the terms selected by the user.
     */
    public removeSelectedItem(gridRow: IGridRow): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '450px',
            position: {top: '20px'},
            data: {
                dialogTitle: 'Confirm?',
                dialogContent: 'Remove the selected terms?',
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.removeDetailItem(gridRow.ref);
            }
        });
    }

    /**
     * Remove the DetailItem from the from the BedesCompositeTerm.
     */
    private removeDetailItem(detailItem: CompositeTermDetail): void {
        this.compositeTerm.removeDetailItem(detailItem);
        this.compositeTermService.setActiveCompositeTerm(this.compositeTerm);
    }

    /**
     * Set's the grid data.
     */
    public setGridData(): void {
        if (this.gridInitialized && this.gridDataNeedsRefresh && this.gridApi) {
            const results = new Array<IGridRow>();
            if  (this.compositeTerm) {
                this.compositeTerm.items.forEach((item: CompositeTermDetail) => {
                    results.push(<IGridRow>{
                        name: item.listOption ? item.listOption.name : item.term.name,
                        description: item.listOption ? item.listOption.description : item.term.description,
                        type: item.listOption ? 'List Option' : 'BEDES Term',
                        ref: item,
                        termCategoryName: this.supportListService.transformIdToName(SupportListType.BedesCategory, item.term.termCategoryId),
                        dataTypeName: item.listOption
                            ? 'Constrained List Option'
                            : this.supportListService.transformIdToName(SupportListType.BedesDataType, item.term.dataTypeId),
                        unitName: this.supportListService.transformIdToName(SupportListType.BedesUnit, item.term.unitId),
                        isEditable: this.isEditable
                    });
                });
            }
            // this.gridOptions.api.setRowData(results);
            this.gridApi.updateGridOptions({rowData: results});
            this.gridDataNeedsRefresh = false;
        }
    }
}
