import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RequestStatus } from '../../enums';
import { Router, ActivatedRoute } from '@angular/router';
import { GridOptions, SelectionChangedEvent, ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { ApplicationService } from '../../services/application/application.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { TableCellNavComponent } from '../../models/ag-grid/table-cell-nav/table-cell-nav.component';
import { MessageFromGrid } from '../../models/ag-grid/message-from-grid';
import { TableCellMessageType } from '../../models/ag-grid/enums/table-cell-message-type.enum';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { applicationScopeList } from '../../../../../../../bedes-common/lookup-tables/application-scope-list';
import { TableCellDeleteComponent } from '../../models/ag-grid/table-cell-delete/table-cell-delete.component';

/**
 * Defines the interface for the rows of grid objects.
 */
interface IAppRow {
    scopeName: string;
    ref: MappingApplication;
    isEditable: boolean;
}

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent extends MessageFromGrid<IAppRow> implements OnInit {
    public get appServiceRef() {
        return this.appService;
    }
    public RequestStatus = RequestStatus;
    public currentRequestStatus: RequestStatus;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private gridInitialized = false;
    private gridDataNeedsRefresh = false;
    public gridData: any;
    private gridApi: GridApi | undefined;
    public selectedItem: IAppRow | undefined;
    // lists
    public applicationList: Array<MappingApplication>;
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;
    // errors
    public hasError = false;
    public errorMessage: string;
    public isEditable: boolean;
    /* The current user */
    public currentUser: CurrentUser;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private appService: ApplicationService,
        private authService: AuthService,
        private dialog: MatDialog
    ) {
        super();
    }

    ngOnInit() {
        this.gridInitialized = false;
        this.gridDataNeedsRefresh = false;
        this.setRouteData();
        this.gridSetup();
        this.setTableContext();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private setRouteData(): void {
        this.route.data
        .subscribe((data: any) => {
            this.applicationList = data.applicationList;
            this.currentUser = data.currentUser;
            this.handleRouteDataSet();
        });
    }

    private handleRouteDataSet(): void {
        this.subscribeToUserStatus();
        this.subscribeToApplicationList();
    }

    /**
     * Subscribe to the user status Observable to get keep the user status up to date.
     */
    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                if (!this.currentUser || this.currentUser.id !== currentUser.id) {
                    this.currentUser = currentUser;
                    this.isEditable = currentUser.isLoggedIn();
                    this.appService.loadUserApplications()
                    .subscribe((results => {
                    }));
                }
            });
    }

    /**
     * Subscribe to the application list observable.
     * Set's the initial list, and will update the list
     * whenever the list is updted from the service.
     */
    private subscribeToApplicationList(): void {
        this.appService.appListSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((appList: Array<MappingApplication>) => {
                this.applicationList = appList;
                this.gridDataNeedsRefresh = true;
                this.setGridData();
            });
    }

    /**
     * Override the abstract class MessageFromGrid.
     *
     * Process the messages from the ag-grid AppTerm list.
     */
    public messageFromGrid(messageType: TableCellMessageType, selectedRow: IAppRow): void {
        this.selectedItem = selectedRow;
        if (messageType === TableCellMessageType.View) {
            this.viewItem(selectedRow);
        }
        else if (messageType === TableCellMessageType.Remove) {
            this.confirmRemoveSelectedItem(selectedRow.ref);
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
                    top: '34%',
                }
            },
            enableRangeSelection: true,
            columnDefs: this.buildColumnDefs(),
            onGridReady: (event: GridReadyEvent) => {
                this.gridApi = event.api;
                this.setGridData();
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                const rows = event.api.getSelectedRows();
                this.selectedItem = rows && rows.length ? rows[0] : undefined;
            }
        };
    }

    /**
     * Confirm the removal of a MappingApplication before calling the backend API.
     */
    private confirmRemoveSelectedItem(item: MappingApplication): void {
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
                this.removeSelectedItem(item);
            }
        });
    }

    /**
     * Remove the application that's currently selected in the table.
     */
    private removeSelectedItem(item: MappingApplication): void {
        this.appService.deleteApplication(item)
        .subscribe(
            (results: boolean) => {
            },
            (error: any) => {
                this.hasError = true;
                this.errorMessage = "An error occurred removing the application.";
            });
    }

    /**
     * Edit the selectedItem App object,
     * ie changes the view to app-edit/:id
     */
    public editSelectedItem(): void {
        this.viewItem(this.selectedItem);
    }

    /**
     * Navigates tot he selected MappingApplication object.
     */
    public viewItem(selectedItem: IAppRow): void {
        this.router.navigate(['/applications', selectedItem.ref.id], {relativeTo: this.activatedRoute});
    }

    /**
     * Builds the column definitions for the list of projects.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'ref.name',
                // checkboxSelection: true
                // minWidth: 250,
                cellRendererFramework: TableCellNavComponent,
                cellStyle: {
                    top: '9%',
                },
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
                cellRendererFramework: TableCellDeleteComponent,
                cellStyle: {
                    top: '9%',
                },
            },
        ];
    }

    /**
     * Populates the grid with the data from the applicationList.
     */
    private setGridData() {
        if (this.gridApi && this.gridDataNeedsRefresh) {
            // const gridData = this.applicationList;
            const gridData = new Array<IAppRow>();
            this.applicationList.forEach((app: MappingApplication) => {
                const scopeObj = applicationScopeList.getItemById(app.scopeId);
                gridData.push(<IAppRow>{
                    scopeName: scopeObj.name,
                    ref: app,
                    isEditable: this.currentUser.canEditApplication(app)
                });
            })
            this.gridDataNeedsRefresh = false;
            this.gridApi.setRowData(gridData);
        }
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
        this.appService.includePublicTerms = event.checked;
    }

}

