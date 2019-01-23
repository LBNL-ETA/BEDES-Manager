import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RequestStatus } from '../../../enums';
import { Router, ActivatedRoute } from '@angular/router';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { TableCellTermNameComponent } from '../../bedes-term-search/bedes-search-results-table/table-cell-term-name/table-cell-term-name.component';
import { ApplicationService } from '../../../services/application/application.service';
import { ApplicationScope } from '@bedes-common/enums/application-scope.enum';
import { TableCellNameNavComponent } from './table-cell-name-nav/table-cell-name-nav.component';
import { AuthService } from '../../../../auth/services/auth/auth.service';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';

/**
 * Defines the interface for the rows of grid objects.
 */
interface IAppRow {
    scopeName: string;
    ref: MappingApplication
}

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {
    public RequestStatus = RequestStatus;
    public currentRequestStatus: RequestStatus;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private gridInitialized = false;
    public selectedItem: IAppRow | undefined;
    // lists
    public applicationList: Array<MappingApplication>;
    private unitList: Array<BedesUnit>;
    private categoryList: Array<BedesTermCategory>;
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
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private termSearchService: BedesTermSearchService,
        private termService: BedesTermService,
        private appService: ApplicationService,
        private supportListService: SupportListService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.gridInitialized = false;
        this.subscribeToUserStatus();
        this.loadApplicationList();
        this.gridSetup();
        this.setTableContext();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the user status Observable to get keep the user status up to date.
     *
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
     * Subscribe to the application list observable.
     * Set's the initial list, and will update the list
     * whenever the list is updted from the service.
     */
    private loadApplicationList(): void {
        this.appService.appListSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((appList: Array<MappingApplication>) => {
            console.log(`${this.constructor.name}: received app list`, appList);
            this.applicationList = appList;
            this.setGridData();
        });
    }

    /**
     * Retrieve the support lists for the view,
     * only the list of applications in this view.
     */
    private assignSupportListData(): void {
        // listen for the applicationList subject
        this.supportListService.applicationSubject.subscribe(
            (results: Array<MappingApplication>) => {
                this.applicationList = results;
                this.setGridData();
            }
        )
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
     * Set the execution context for the table.  Used for cell renderers
     * to be able to access the parent component methods.
     */
    private setTableContext(): void {
        this.tableContext = {
            parent: this
        };
    }

    // public viewTerm(selectedItem: any): void {
    //     console.log(`${this.constructor.name}: view the selected item`);
    // }

    /**
     * Remove the application that's currently selected in the table.
     */
    public removeSelectedItem(): void {
        console.log(`${this.constructor.name}: removeSelectedItem`);
        this.appService.deleteApplication(this.selectedItem.ref)
        .subscribe(
            (results: boolean) => {
                console.log(`${this.constructor.name}: received results`);
                console.log(results);
            },
            (error: any) => {
                console.log('Error removing MappingApplication', this.selectedItem);
                console.log(error);
                this.hasError = true;
                this.errorMessage = "An error occurred removing the application.";
            });
    }

    /**
     * Edit the selectedItem App object,
     * ie changes the view to app-edit/:id
     */
    public editSelectedItem(): void {
        // console.log(`${this.constructor.name}: edit selected item`, this.selectedItem.id);
        // this.router.navigate(['../view/', this.selectedItem.id], {relativeTo: this.activatedRoute});
        // this.router.navigate(['/applications', selectedItem.ref.id], {relativeTo: this.activatedRoute});
        this.viewItem(this.selectedItem);
    }

    /**
     * Navigates tot he selected MappingApplication object.
     */
    public viewItem(selectedItem: IAppRow): void {
        console.log(`${this.constructor.name}: view application`, selectedItem);
        this.router.navigate(['/applications', selectedItem.ref.id], {relativeTo: this.activatedRoute});
        // if ( selectedItem.ref.resultObjectType === SearchResultType.BedesTerm
        //     || selectedItem.ref.resultObjectType === SearchResultType.BedesConstrainedList
        // ) {
        //     if (selectedItem.ref.uuid) {
        //         this.router.navigate(['/bedes-term', selectedItem.ref.uuid]);
        //     }
        //     else if (selectedItem.ref.id) {
        //         this.router.navigate(['/bedes-term', selectedItem.ref.id]);
        //     }
        //     else {
        //         console.error('unable to find route for selectedRow', selectedItem);
        //     }
        // }
        // else if (selectedItem.ref.resultObjectType === SearchResultType.BedesTermOption) {
        //     // navigate to bedes-term/term_uuid_or_id/edit/option_uuid_or_id
        //     const termId = selectedItem.ref.termUUID || selectedItem.ref.termId;
        //     const optionId = selectedItem.ref.uuid || selectedItem.ref.id;
        //     this.router.navigate(['/bedes-term', termId, 'edit', optionId]);
        // }
        // else {
        //     console.error('unable to find route for selectedRow', selectedItem);
        // }
    }

    /**
     * Builds the column definitions for the list of projects.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'ref.name',
                checkboxSelection: true
                // minWidth: 250,
                // cellRendererFramework: TableCellNameNavComponent
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
        if (this.gridOptions && this.gridOptions.api && this.applicationList) {
            // const gridData = this.applicationList;
            const gridData = new Array<IAppRow>();
            this.applicationList.forEach((app: MappingApplication) => {
                gridData.push(<IAppRow>{
                    scopeName: app.scopeId === ApplicationScope.Public ? 'Public' : 'Private',
                    ref: app
                });
            })
            this.gridOptions.api.setRowData(gridData);
        }
    }

}

