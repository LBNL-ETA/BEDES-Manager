import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { takeUntil, map, tap, catchError } from 'rxjs/operators';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { GridApi, GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { ApplicationService } from '../../../services/application/application.service';
import { AppTerm, AppTermList, IAppTerm } from '@bedes-common/models/app-term';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { AppTermService } from '../../../services/app-term/app-term.service';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { TableCellNavComponent } from '../../../models/ag-grid/table-cell-nav/table-cell-nav.component';
import { TableCellMessageType } from '../../../models/ag-grid/enums/table-cell-message-type.enum';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { TermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic';
import { TermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite';
import { MessageFromGrid } from '../../../models/ag-grid/message-from-grid';
import { IAppRow } from './app-row.interface';
import { TermStatus } from './term-status.enum';
import { TableCellAppTermStatusComponent } from './table-cell-app-term-status/table-cell-app-term-status.component';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { CsvImportInfoDialogComponent } from '../../dialogs/csv-import-info-dialog/csv-import-info-dialog.component';
import { scopeList } from '@bedes-common/lookup-tables/scope-list';
import { TableCellDeleteComponent } from '../../../models/ag-grid/table-cell-delete/table-cell-delete.component';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { SupportListService } from '../../../services/support-list/support-list.service';

@Component({
  selector: 'app-app-term-list',
  templateUrl: './app-term-list.component.html',
  styleUrls: ['./app-term-list.component.scss']
})
export class AppTermListComponent extends MessageFromGrid<IAppRow> implements OnInit, OnDestroy {
    private gridInitialized: boolean;
    // Boolean that indicates if the grid's data needs to be set.
    // When a new appTermList is received, this flag is set to true
    private gridDataNeedsSet: boolean
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    // the active MappingApplication
    public app: MappingApplication;
    // the selected row in the grid,
    // ie the selected AppTerm (row.ref)
    public selectedItem: IAppRow;
    // lists
    public appTermList: Array<AppTerm | AppTermList> | undefined;
    private unitList: Array<BedesUnit>;
    // ag-grid
    public gridOptions: GridOptions;
    private gridApi: GridApi | null = null;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;
    // Error messages
    public hasError = false;
    public errorMessage: string;
    /* The current user */
    public currentUser: CurrentUser;
    // String containing csv data
    private csvExportData: string = '';
    // String containing application name
    private appName: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private activatedRoute: ActivatedRoute,
        private appService: ApplicationService,
        private appTermService: AppTermService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private bedesTermService: BedesTermService,
        private supportListService: SupportListService,
    ) {
        super();
    }

    ngOnInit() {
        this.subscribeToUserStatus();
        this.gridInitialized = false;
        this.gridDataNeedsSet = false;
        this.gridSetup();
        this.setTableContext();
        this.subscrbeToApplicationData();
        this.subscribeToAppTermList();
        this.initializeSupportLists();
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
                this.currentUser = currentUser;
                // this.isEditable = currentUser.canEditApplication(this.app);
            });
    }

    /**
     * Subscribe to the active MappingApplication object.
     */
    private subscrbeToApplicationData(): void {
        this.appService.selectedItemSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((app: MappingApplication) => {
                this.app = app;
            });
    }

    /**
     * Subscribe to the application list observable.
     * Set's the initial list, and will update the list
     * whenever the list is updted from the service.
     */
    private subscribeToAppTermList(): void {
        this.appTermService.termListSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((termList: Array<AppTerm | AppTermList>) => {
            this.appTermList = termList;
            this.gridDataNeedsSet = true;
            this.setGridData(this.gridApi);
        });
    }

    public canEditApplication(): boolean {
        return this.app && this.currentUser && this.currentUser.canEditApplication(this.app);
    }

    /**
     * Create a new AppTerm object, and navigate to the AppTerm route.
     */
    public newTerm(): void {
        const params: IAppTerm = {
            _name: 'New App Term',
            _termTypeId: TermType.Atomic,
            _dataTypeId: null
        }
        const newTerm = new AppTerm(params);
    }

    public newAtomicTerm(): void {
        const params: IAppTerm = {
            _name: 'New App Term',
            _termTypeId: TermType.Atomic,
            _dataTypeId: null
        }
        // create the new term
        const newTerm = new AppTerm(params);
        // add the new term to the current AppTerm list
        this.appTermService.addAppTermToList(newTerm);
        // navigate to the edit url for the new term
        this.router.navigate([newTerm.uuid], {relativeTo: this.activatedRoute});
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
            onGridReady: (params) => {
                this.gridInitialized = true;
                this.gridApi = params.api;

                if (params.api && this.gridOptions && this.gridOptions.api && this.gridDataNeedsSet) {
                    this.setGridData(this.gridApi);
                }
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
     * Confirm the removal of an AppTerm before calling the backend API.
     */
    private confirmRemoveSelectedItem(appTerm: AppTerm | AppTermList): void {
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
                this.removeSelectedItem(appTerm);
            }
        });
    }

    /**
     * Remove the application that's currently selected in the table.
     */
    private removeSelectedItem(appTerm: AppTerm | AppTermList): void {
        // get the reference to the selected AppTerm, if there is one
        if (appTerm) {
            // remove the term
            this.appTermService.removeTerm(this.app.id, appTerm)
            .subscribe((results: number) => {
                this.snackBar.open('AppTerm successfully removed!', undefined, {duration: 3000});
            }, (error: any) => {
            });
        }
        else {
            throw new Error('removeSelectedItem expected a valid AppTerm and id');
        }
    }

    /**
     * Edit the selectedItem App object,
     * ie changes the view to app-edit/:id
     */
    private editSelectedItem(appTerm: AppTerm | AppTermList): void {
        // set the activeTerm in the service
        this.appTermService.setActiveTerm(appTerm);
        this.router.navigate([appTerm.uuid], {relativeTo: this.activatedRoute});
    }

    /**
     * Override the abstract class MessageFromGrid.
     * Process the messages from the ag-grid AppTerm list.
     */
    public messageFromGrid(messageType: TableCellMessageType, selectedRow: IAppRow): void {
        this.selectedItem = selectedRow;
        if (messageType === TableCellMessageType.View) {
            this.editSelectedItem(selectedRow.ref);
        }
        else if (messageType === TableCellMessageType.Remove) {
            this.confirmRemoveSelectedItem(selectedRow.ref);
        }
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
                headerName: 'Mapped Term Name',
                field: 'mappedName'
            },
            {
                headerName: 'Mapped Term Owner',
                field: 'ownerName'
            },
            {
                headerName: 'Mapped Term Sharing',
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
     * Populates the grid with the data from the appTermList
     */
    private setGridData(api: GridApi) {
        if (this.gridInitialized && this.gridDataNeedsSet && this.gridOptions.api) {
            // const gridData = this.applicationList;
            const gridData = new Array<IAppRow>();
            const isAppOwner = this.currentUser.isApplicationOwner(this.app);
            this.appTermList.forEach((appTerm: AppTerm | AppTermList) => {
                let mappingName = '';
                if (appTerm && appTerm.mapping instanceof TermMappingAtomic && appTerm.mapping.bedesTermUUID) {
                    mappingName = appTerm.mapping.bedesName
                }
                else if (appTerm && appTerm.mapping instanceof TermMappingComposite && appTerm.mapping.bedesName) {
                    mappingName = appTerm.mapping.bedesName
                }

                let ownerName: string | null | undefined;
                let scopeName: string | null | undefined;

                if (appTerm.mapping instanceof TermMappingComposite) {
                    ownerName = appTerm.mapping.ownerName;
                    const scopeObj = scopeList.getItemById(appTerm.mapping.scopeId);
                    scopeName = scopeObj ? scopeObj.name : 'unknown';
                }

                gridData.push(<IAppRow>{
                    termStatus: appTerm.id ? TermStatus.Existing : TermStatus.New,
                    ref: appTerm,
                    mappedName: mappingName,
                    ownerName: ownerName,
                    scopeName: scopeName,
                    isEditable: isAppOwner
                });
            })
            api.updateGridOptions({rowData: gridData});
            this.gridDataNeedsSet = false;
        }
    }

    /**
     * Determines if the current displayed list has AppTerms that have not been saved to the db.
     * @returns true if there are AppTerms that need to be saved.
     */
    public hasUnsavedAppTerms(): boolean {
        if (Array.isArray(this.appTermList)) {
            return this.numberOfNewTerms() > 0 ? true : false;
        }
        else {
            false;
        }
    }

    /**
     * Set's the error message from the response error.
     */
    private setErrorMessage(error: any): void {
        if (error && error.status === HttpStatusCodes.BadRequest_400 && error.error) {
            this.errorMessage = error.error;
        }
        else {
            this.errorMessage = "An unknown error occured, application term(s) not created."
        }
        this.hasError = true;
    }

    /**
     * Reset the error.
     */
    private resetError(): void {
        this.errorMessage = "";
        this.hasError = false;
    }

    /**
     * Calculates the number of AppTerms that haven't been saved to the database.
     * @returns The number of AppTerms that have not been saved to the database.
     */
    public numberOfNewTerms(): number {
        return this.appTermList
            ? this.appTermList.reduce(
                (accum: number, term: AppTerm | AppTermList) => {
                    return accum + (term.id ? 0 : 1);
                },
                0)
            : 0;
    }

    /**
     * Open the csv upload dialog.
     */
    public openCsvUploadDialog(): void {
        const dialogRef = this.dialog.open(CsvImportInfoDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '650px',
            position: {top: '20px'}
        });
        dialogRef.afterClosed()
        .subscribe((selectedFile: any) => {
            if (selectedFile) {
                this.resetError();
                this.appTermService.uploadAppTerms(this.app.id, selectedFile)
                .subscribe((csvTerms: Array<AppTerm | AppTermList>) => {
                    console.log('Successfully imported csv terms');
                }, (error: any) => {
                    alert(error);
                    // this.errorMessage = 'Unable to create application terms.'
                    // this.hasError = true;
                });
             }
       });
    }

    /**
     * Subscribe to the supportList Observable to get the UnitList.
     */
    private initializeSupportLists(): void {
        // Get the Array of BedesUnit objects.
        this.supportListService.unitListSubject.subscribe(
            (results: Array<BedesUnit>) => {
                this.unitList = results;
            }
        );
    }

    /**
     * Download mappings to csv.
     */
    public downloadCSV(): void {
        this.appTermService.downloadAppTerms(this.app.id)
            .subscribe(
                (data) => {
                    this.appName = data['appName'];
                    this.csvExportData = data['data'];
                },
                (error) => {
                    console.log('Error downloading csv.');
                },
                () => {
                    // Download .csv file

                    // Check out this article
                    // https://coderwall.com/p/y347ug/encodeuri-vs-encodeuricomponent
                    var encodedUriComp = 'data:text/csv;charset=utf-8,' + encodeURIComponent(this.csvExportData);

                    var link = document.createElement("a");
                    link.setAttribute("href", encodedUriComp);
                    link.setAttribute("download", 'BEDES Application Export - ' + this.appName + '.csv');
                    document.body.appendChild(link);
                    link.click();
                }
            );
    }
}
