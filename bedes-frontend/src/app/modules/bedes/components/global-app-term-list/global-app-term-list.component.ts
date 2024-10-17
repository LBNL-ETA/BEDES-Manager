import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatLegacyCheckboxChange as MatCheckboxChange} from '@angular/material/legacy-checkbox';
import {GlobalAppTermService} from '../../services/global-app-term/global-app-term.service';
import {AppTerm, AppTermList} from '@bedes-common/models/app-term';
import {takeUntil} from 'rxjs/operators';
import {CurrentUser} from '@bedes-common/models/current-user';
import {AuthService} from '../../../bedes-auth/services/auth/auth.service';
import {Subject} from 'rxjs';
import {ColDef, GridApi, GridOptions, GridReadyEvent, SelectionChangedEvent} from 'ag-grid-community';
import {TableCellNavComponent} from '../../models/ag-grid/table-cell-nav/table-cell-nav.component';
import {TableCellDeleteComponent} from '../../models/ag-grid/table-cell-delete/table-cell-delete.component';
import {TableCellMessageType} from '../../models/ag-grid/enums/table-cell-message-type.enum';
import {MessageFromGrid} from '../../models/ag-grid/message-from-grid';
import {AppTermService} from '../../services/app-term/app-term.service';
import {Router} from '@angular/router';
import {applicationScopeList} from '@bedes-common/lookup-tables/application-scope-list';
import {ApplicationService} from '../../services/application/application.service';
import {MappingApplication} from '@bedes-common/models/mapping-application';

interface IGridRow {
    name: string;
    scope?: string;
    ref: AppTerm | AppTermList;
    isEditable?: boolean;
    scopeName?: string;
}

@Component({
    selector: 'app-global-app-term-list',
    templateUrl: './global-app-term-list.component.html',
    styleUrls: ['./global-app-term-list.component.scss']
})

export class GlobalAppTermListComponent extends MessageFromGrid<IGridRow> implements OnInit, OnDestroy {

    currentUser: CurrentUser;
    appTermList: Array<AppTerm | AppTermList> | undefined;
    isEditable = true;
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: IGridRow[];
    public tableContext: any;
    /** API object for the ag-grid component */
    private gridApi: GridApi | undefined;
    // Indicates if the grid has been initialized.
    private gridInitialized = false;
    // Indicates if the grid's data needs to be set
    private gridDataNeedsSet = false;
    // The current selected row
    private selectedItem: IGridRow | undefined;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private globalAppTermService: GlobalAppTermService,
                private authService: AuthService,
                private appService: ApplicationService,
                private appTermService: AppTermService,
                private router: Router) {
        super();
    }

    get globalAppTermServiceRef() {
        return this.globalAppTermService;
    }

    ngOnInit(): void {
        // This is so that routing to individual app terms will work.
        this.appService.includePublicTerms = this.globalAppTermServiceRef.includePublicTerms;
        this.appService.loadUserApplications()
            .subscribe((results => {
            }));
        this.subscribeToUserStatus();
        this.subscribeToIncludePublicTerms();
        this.subscribeToTermList();
        this.gridSetup();
        this.setTableContext();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    quickFilterChange($event: any) {
        if (this.gridApi) {
            this.gridApi.setQuickFilter($event.target.value);
        }
    }

    showPublicChange($event: MatCheckboxChange) {
        this.globalAppTermService.includePublicTerms = $event.checked;
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
            this.editSelectedItem(this.selectedItem.ref);
        }
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
        this.globalAppTermService.load();
    }

    /**
     * Subscribe to the composite term list BehaviorSubject.
     */
    private subscribeToTermList(): void {
        this.globalAppTermService.appTermListSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((termList: Array<AppTerm | AppTermList>) => {
                this.appTermList = termList;
                this.gridDataNeedsSet = true;
                this.setGridData();
            });
        this.globalAppTermService.load();
    }

    private subscribeToIncludePublicTerms(): void {
        this.globalAppTermService.includePublicTermsSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((includePublicTerms) => {
                // This is so that routing to individual app terms will work.
                this.appService.includePublicTerms = this.globalAppTermServiceRef.includePublicTerms;
                this.appService.loadUserApplications()
                    .subscribe((results => {
                    }));
                this.globalAppTermService.load();
            });
    }

    /**
     * Setup the ag-grid for the list of projects.
     */
    private gridSetup(): void {
        this.gridOptions = {
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
            onFirstDataRendered: (params) => {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                const rows = event.api.getSelectedRows();
                this.selectedItem = rows && rows.length === 1 ? rows[0] : undefined;
                this.rowData = rows;
            },
            isRowSelectable: (rowNode) => rowNode.data?.isEditable === true
        } as GridOptions;
    }

    /**
     * Builds the column definitions for the list of projects.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Application Term Name',
                field: 'ref.name',
                cellRenderer: TableCellNavComponent,
                cellStyle: {
                }
            },
            {
                headerName: 'Mapped BEDES Term Name',
                field: 'ref.mapping.bedesName',
            },
            {
                headerName: 'Application Name',
                field: 'ref.applicationName',
            },
            {
                headerName: 'Owner',
                field: 'ref.applicationOwner'
            },
            {
                headerName: 'Sharing',
                field: 'scopeName'
            },
        ];
    }

    /**
     * Populates the grid with the data from the applicationList.
     */
    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsSet && this.gridApi) {
            const gridData = new Array<IGridRow>();
            if (Array.isArray(this.appTermList)) {
                this.appTermList.forEach((item: AppTerm | AppTermList) => {
                    const scopeObj = applicationScopeList.getItemById(item.applicationScopeId);
                    gridData.push({
                        ref: item,
                        scopeName: scopeObj.name,
                    } as IGridRow);
                });
            }
            // this.gridOptions.api.setRowData(gridData);
            this.gridApi.updateGridOptions({rowData: gridData});
            
            this.gridDataNeedsSet = false;
        }
    }

    private editSelectedItem(appTerm: AppTerm | AppTermList): void {
        this.appService.setActiveApplicationById(appTerm.appId);
        this.appTermService.setActiveTerm(appTerm);
        this.router.navigate(['/applications', appTerm.appId, 'terms', appTerm.uuid]);
    }

}
