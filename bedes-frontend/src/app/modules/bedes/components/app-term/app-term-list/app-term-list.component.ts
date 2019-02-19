import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { takeUntil, map, tap, catchError } from 'rxjs/operators';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { ApplicationService } from '../../../services/application/application.service';
import { ApplicationScope } from '@bedes-common/enums/application-scope.enum';
// import { TableCellNameNavComponent } from './table-cell-name-nav/table-cell-name-nav.component';
import { AppTerm, AppTermList, IAppTerm } from '@bedes-common/models/app-term';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { AppTermService } from '../../../services/app-term/app-term.service';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { TableCellNavComponent } from '../../../models/ag-grid/table-cell-nav/table-cell-nav.component';
import { TableCellMessageType } from '../../../models/ag-grid/enums/table-cell-message-type.enum';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { TermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic';
import { TermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite';
import { MessageFromGrid } from '../../../models/ag-grid/message-from-grid';
import { IAppRow } from './app-row.interface';
import { TermStatus } from './term-status.enum';
import { TableCellAppTermStatusComponent } from './table-cell-app-term-status/table-cell-app-term-status.component';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';

@Component({
  selector: 'app-app-term-list',
  templateUrl: './app-term-list.component.html',
  styleUrls: ['./app-term-list.component.scss']
})
export class AppTermListComponent extends MessageFromGrid<IAppRow> implements OnInit {
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
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;
    // Error messages
    public hasError = false;
    public errorMessage: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private activatedRoute: ActivatedRoute,
        private appService: ApplicationService,
        private appTermService: AppTermService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        super();
    }

    ngOnInit() {
        this.gridInitialized = false;
        this.gridDataNeedsSet = false;
        this.gridSetup();
        this.setTableContext();
        this.subscrbeToApplicationData();
        this.subscribeToAppTermList();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
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
            console.log(`${this.constructor.name}: received app term list`, termList);
            this.appTermList = termList;
            this.gridDataNeedsSet = true;
            this.setGridData();
        });
    }

    /**
     * Create a new AppTerm object, and navigate to the AppTerm route.
     */
    public newTerm(): void {
        const params: IAppTerm = {
            _name: 'New App Term',
            _termTypeId: TermType.Atomic
        }
        const newTerm = new AppTerm(params);
    }

    public newAtomicTerm(): void {
        const params: IAppTerm = {
            _name: 'New App Term',
            _termTypeId: TermType.Atomic
        }
        // create the new term
        const newTerm = new AppTerm(params);
        // add the new term to the current AppTerm list
        this.appTermService.addAppTermToList(newTerm);
        // navigate to the edit url for the new term
        this.router.navigate([newTerm.uuid], {relativeTo: this.activatedRoute});
    }

    /**
     * Retrieve the support lists for the view,
     * only the list of applications in this view.
     */
    // private assignSupportListData(): void {
    //     // listen for the applicationList subject
    //     this.supportListService.applicationSubject.subscribe(
    //         (results: Array<MappingApplication>) => {
    //             this.applicationList = results;
    //             this.setGridData();
    //         }
    //     )
    // }

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
                if (this.gridOptions && this.gridOptions.api && this.gridDataNeedsSet) {
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

    // public viewTerm(selectedItem: any): void {
    //     console.log(`${this.constructor.name}: view the selected item`);
    // }

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
            console.log('dialogRef.afterClosed()', results);
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
                console.log(`${this.constructor.name}: delete appTerm success`, results);
                this.snackBar.open('AppTerm successfully removed!', undefined, {duration: 3000});
            }, (error: any) => {
                console.log('An error occurred removing AppTerm', error);
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
        console.log(`${this.constructor.name}: edit selected item`, appTerm);
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
     * Navigates tot he selected AppTerm object.
     */
    // public viewItem(selectedItem: IAppRow): void {
    //     console.log(`${this.constructor.name}: view term`, selectedItem);
    //     this.router.navigate(['/app-term', selectedItem.ref.id]);
    // }

    /**
     * Builds the column definitions for the list of projects.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Status',
                field: 'termStatus',
                cellRendererFramework: TableCellAppTermStatusComponent,
                width: 50
            },
            {
                headerName: 'Application Term Name',
                field: 'ref.name',
                cellRendererFramework: TableCellNavComponent
            },
            {
                headerName: 'Mapped BEDES Term Name',
                field: 'mappedName'
            }
        ];
    }

    /**
     * Populates the grid with the data from the appTermList
     */
    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsSet && this.gridOptions.api) {
            // const gridData = this.applicationList;
            const gridData = new Array<IAppRow>();
            this.appTermList.forEach((appTerm: AppTerm | AppTermList) => {
                let mappingName = '';
                if (appTerm && appTerm.mapping instanceof TermMappingAtomic && appTerm.mapping.bedesTermUUID) {
                    mappingName = appTerm.mapping.bedesName
                }
                else if (appTerm && appTerm.mapping instanceof TermMappingComposite && appTerm.mapping.bedesName) {
                    mappingName = appTerm.mapping.bedesName
                }

                gridData.push(<IAppRow>{
                    termStatus: appTerm.id ? TermStatus.Existing : TermStatus.New,
                    ref: appTerm,
                    mappedName: mappingName
                });
            })
            this.gridOptions.api.setRowData(gridData);
            this.gridDataNeedsSet = false;
        }
    }

    /**
     * Calls the AppTermService to upload the file selected from the
     * file input control.  Should be fired when the file input changes.
     */
    public fileSelected(event: any): void {
        if (event && event.srcElement && event.srcElement.files && event.srcElement.files.length) {
            const uploadFile = event.srcElement.files[0];
            // upload the file to the backend
            // the BehaviorSubject subscribtion handles updating the new term list and table
            this.appTermService.uploadAppTerms(this.app.id, uploadFile)
            .subscribe((csvTerms: Array<AppTerm | AppTermList>) => {
                console.log('successfully uploaded app terms');
                console.log(csvTerms);
            });
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
     * Saves all **New** AppTerms to the database.
     *
     * @summary Looks at the appTermList Array for all AppTerms with an id
     * that's null or undefined, then uses the AppTermService to call the backend
     * and save the terms to the database.
     */
    public saveAllNewAppTerms(): void {
        this.resetError();
        if (Array.isArray(this.appTermList)) {
            // keeps track of all active save requests
            const observables = new Array<Observable<AppTerm | AppTermList>>();
            // loop through each AppTerm
            this.appTermList.forEach(((item: AppTerm | AppTermList) => {
                if (!item.id) {
                    // if there isn't an id then call the backend to save the term
                    // store the observable in the observables array
                    observables.push(
                        this.appTermService.newAppTerm(this.app.id, item)
                        .pipe(
                            map((results: AppTerm | AppTermList) => {
                                // update the id of the record
                                AppTerm.updateObjectValues(results, item);
                                return results;
                            }),
                            catchError((error: any): Observable<AppTerm | AppTermList> => {
                                // catch the error, return the original AppTerm before the save
                                if (!this.hasError) {
                                    this.setErrorMessage(
                                        `An error occurred saving an AppTerm.
                                        See the table below for terms that weren't saved.`
                                    );
                                }
                                return of(item);
                            })
                        )
                    );
                }
            }))
            // check if there's any items to save
            if(observables.length) {
                // wait for all observables to complete
                forkJoin(observables)
                .subscribe(
                    (results: Array<AppTerm | AppTermList>) => {
                        console.log(`${this.constructor.name}: receved results`);
                        console.log(results);
                        this.appTermService.refreshActiveTerms();
                    },
                    (error: any) => {
                        console.log(`this error shouldn't have happened????`);
                        console.log(error);
                    })
            }
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

}
