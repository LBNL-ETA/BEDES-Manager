import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {ApplicationService} from '../../../../services/application/application.service';
import {MappingApplication} from '@bedes-common/models/mapping-application/mapping-application';
import {HttpStatusCodes} from '@bedes-common/enums/http-status-codes';
import {AppTermService} from '../../../../services/app-term/app-term.service';
import {AppTerm, AppTermList, AppTermListOption, IAppTerm, IAppTermList, IAppTermListOption} from '@bedes-common/models/app-term';
import {appTermTypeList} from '@bedes-common/lookup-tables/app-term-type-list';
import {dataTypeList} from '@bedes-common/lookup-tables/data-type-list';
import {switchMap, takeUntil} from 'rxjs/operators';
import {ColDef, GridOptions, SelectionChangedEvent} from 'ag-grid-community';
import {TermType} from '@bedes-common/enums/term-type.enum';
import {OptionViewState} from 'src/app/modules/bedes/models/list-options/option-view-state.enum';
import {SupportListService} from '../../../../services/support-list/support-list.service';
import {BedesUnit} from '@bedes-common/models/bedes-unit/bedes-unit';
import {TableCellNavComponent} from '../../../../models/ag-grid/table-cell-nav/table-cell-nav.component';
import {TableCellMessageType} from '../../../../models/ag-grid/enums/table-cell-message-type.enum';
import {AppTermListOptionService} from '../../../../services/app-term-list-option/app-term-list-option.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../dialogs/confirm-dialog/confirm-dialog.component';
import {BedesTermSearchDialogComponent} from '../../../dialogs/bedes-term-search-dialog/bedes-term-search-dialog.component';
import {ISearchDialogOptions} from '../../../dialogs/bedes-term-search-dialog/search-dialog-options.interface';
import {BedesSearchResult} from '@bedes-common/models/bedes-search-result/bedes-search-result';
import {SearchResultType} from '@bedes-common/models/bedes-search-result/search-result-type.enum';
import {BedesCompositeTerm} from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import {BedesConstrainedList} from '@bedes-common/models/bedes-term/bedes-constrained-list';
import {BedesTerm} from '@bedes-common/models/bedes-term/bedes-term';
import {CompositeTermService} from '../../../../services/composite-term/composite-term.service';
import {BedesTermService} from '../../../../services/bedes-term/bedes-term.service';
import {TermMappingAtomic} from '@bedes-common/models/term-mapping/term-mapping-atomic';
import {TableCellMapListOptionComponent} from '../table-cell-map-list-option/table-cell-map-list-option.component';
import {MappingTableMessageType} from '../mapping-table-message-type.enum';
import {ListOptionMapDialogComponent} from '../../../dialogs/list-option-map-dialog/list-option-map-dialog.component';
import {BedesTermOption} from '@bedes-common/models/bedes-term-option/bedes-term-option';
import {TermMappingComposite} from '@bedes-common/models/term-mapping/term-mapping-composite';
import {AuthService} from '../../../../../bedes-auth/services/auth/auth.service';
import {CurrentUser} from '@bedes-common/models/current-user/current-user';
import {INewListOption, NewListOptionDialogComponent} from './new-list-option-dialog/new-list-option-dialog.component';
import {TableCellDeleteComponent} from '../../../../models/ag-grid/table-cell-delete/table-cell-delete.component';
import {scopeList} from '@bedes-common/lookup-tables/scope-list';

enum RequestStatus {
    Idle=1,
    Pending=2,
    Success=3,
    Error=4
}
enum ControlState {
    Normal=1,
    Disabled,
    FormSuccess
}
interface IGridRow {
    implFieldName: string | null | undefined;
    implUnitId: number | null | undefined;
    ref: AppTermListOption;
    showMappingButtons: boolean;
    hasMapping: boolean;
    mappedName: string | null | undefined;
    isEditable: boolean;
}


/**
 * View handler for application term editing.
 */
@Component({
  selector: 'app-implementation-term',
  templateUrl: './implementation-term.component.html',
  styleUrls: ['./implementation-term.component.scss']
})
export class ImplementationTermComponent implements OnInit {
    /** Indicates if the current term is new term */
    public isNewTerm = false;
    // The active MappingApplication object.
    public app: MappingApplication;
    // The active MappingApplication's AppTerms
    public termList: Array<AppTerm | AppTermList>;
    // The current AppTerm object that's being modified
    public appTerm: AppTerm | AppTermList | undefined;
    // The current active list option
    public activeListOption: AppTermListOption | undefined;
    /**
     * Holds the array of list options when a term is switched from AppTermList -> AppTerm,
     * and applies them back when switching from AppTerm -> AppTermList
     */
    private listOptionHold: Array<IAppTermListOption>;
    // Holds the current app term type selected in the dropdown
    public currentTermType: TermType;
    // Enum for TermType
    public TermType = TermType;
    // The BEDES term (atomic or composite) that's currently mapped to this appTerm
    public mappedTerm: BedesTerm | BedesConstrainedList | BedesCompositeTerm | undefined;
    // List for the various BedesUnits
    public unitList: Array<BedesUnit>;
    // controls the current state of of the form controls
    public currentControlState = ControlState.Normal;
    public ControlState = ControlState;
    // Error messages
    public hasError: boolean;
    public errorMessage: string;
    // list of AppTermTypes (for dropdown list)
    public appTermTypeItems = appTermTypeList.items;
    // list of data types (for dropdown list)
    public dataTypeItems = dataTypeList.items;
    // grid properties
    // grid is ready boolean indicator
    private gridInitialized: boolean;
    // Boolean that indicates if the grid's data needs to be set.
    private gridDataNeedsSet: boolean
    public gridOptions: GridOptions;
    public gridData: Array<IGridRow>;
    public tableContext: any;
    // Enum for the status of the current outgoing http request
    public RequestStatus = RequestStatus;
    // subject for unsibscribing from BehaviorSubjects
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    //  The data form object.
    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: [''],
        unit: [''],
        uuid: [{
            value: null,
            disabled: true
        }],
        termTypeId: [null, Validators.required],
        dataTypeId: [null, Validators.required]
    });

    public stateChangeSubject: BehaviorSubject<OptionViewState>;
    public currentViewState: OptionViewState;

    private currentUser: CurrentUser | undefined;

    /**
     * Create the object instance.
     */
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private appService: ApplicationService,
        private appTermService: AppTermService,
        private listOptionService: AppTermListOptionService,
        private bedesTermService: BedesTermService,
        private compositeTermService: CompositeTermService,
        private supportListService: SupportListService,
        private dialog: MatDialog,
        private authService: AuthService,
    ) {}

    ngOnInit() {
        // set some grid initialization variables
        this.gridDataNeedsSet = true;
        this.gridInitialized = false;
        // set the current list option view
        this.currentViewState = OptionViewState.ListOptionsView;
        this.setRouteData()
        this.setIsNewTerm();
        this.subscribeToUserStatus();
        this.initializeSupportLists();
        this.subscrbeToMappingApplication();
        if (!this.isNewTerm) {
            this.subscribeToActiveTerm();
        }
        this.subscribeToFormChanges();
        this.gridSetup();
        this.setTableContext();
        this.initializeStateChanges();
        if (this.isNewTerm) {
            this.setFormData();
        }
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private setRouteData(): void {
        this.route.data
        .subscribe((data: any) => {
            this.appTerm = data.appTerm;
        });
    }

    /**
     * Checks the url to see if we're editing a new term.
     */
    private setIsNewTerm(): void {
        this.route.url
            .subscribe((results: UrlSegment[]) => {
                if (results.length == 2 && results[1].path === 'new') {
                    this.isNewTerm = true;
                }
            })
    }

    /**
     * Subscribe to the active MappingApplication object.
     */
    private subscrbeToMappingApplication(): void {
        this.appService.selectedItemSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((app: MappingApplication) => {
                this.app = app;
                this.updateFormControlStatus();
            });
    }

    /**
     * Subscribe to the BehaviorSubject that serves the
     * active Mapping Application's set of AppTerms.
     */
    private subscribeToActiveTerm(): void {
        this.appTermService.activeTermSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((activeTerm: AppTerm | AppTermList | undefined) => {
                this.appTerm = activeTerm;
                // if the appTerm is undefined create a new one
                if (!this.appTerm) {
                    this.router.navigate(['..'], {relativeTo: this.route})
                    // this.setNewAppTerm();
                }
                else {
                    if (this.appTerm.mapping) {
                        this.setMappedTerm()
                    }
                    // set the form data
                    this.setFormData();
                }
            });
    }

    /**
     * Subscribe to the user status Observable to get keep the user status up to date.
     */
    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                this.currentUser = currentUser;
                this.updateFormControlStatus();
            });
    }

    /**
     * Set the form controls to editable/non-editable
     */
    private updateFormControlStatus(): void {
        if (this.canEditApplication()) {
            this.enableFormControls();
        } else {
            this.disableFormControls();
        }
    }

    /**
     * Determines if the current authenticated user can edit the application
     *
     * @returns true if edit application
     */
    public canEditApplication(): boolean {
        return this.app && !this.app.isApproved() && this.currentUser && this.currentUser.canEditApplication(this.app);
    }

    private enableFormControls(): void {
        this.dataForm.controls.name.enable();
        this.dataForm.controls.description.enable();
        this.dataForm.controls.unit.enable();
        this.dataForm.controls.termTypeId.enable();
        this.dataForm.controls.dataTypeId.enable();
    }

    private disableFormControls(): void {
        this.dataForm.controls.name.disable();
        this.dataForm.controls.description.disable();
        this.dataForm.controls.unit.disable();
        this.dataForm.controls.termTypeId.disable();
        this.dataForm.controls.dataTypeId.disable();
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
     * Initialize the BehaviorSubject use in communicating with the edit component
     * when it's time for a state change.
     */
    private initializeStateChanges(): void {
        // set the default view to display the list of options
        this.currentViewState = OptionViewState.ListOptionsView;
        this.stateChangeSubject = new BehaviorSubject<OptionViewState>(OptionViewState.ListOptionsView);
        // listen for calls to this BehaviorSubject
        this.stateChangeSubject.subscribe((newState: OptionViewState) => {
            this.currentViewState = newState;
        });
    }

    public clearMappedTerm(): void {
        this.appTerm.clearMapping();
        this.mappedTerm = undefined;
    }

    /**
     * Set the current mapped BedesTerm to the term identified by current AppTerm mapping.
     */
    private setMappedTerm(): void {
        if (this.appTerm && this.appTerm.mapping) {
            let uuid: string;
            if (this.appTerm.mapping instanceof TermMappingAtomic) {
                uuid = this.appTerm.mapping.bedesTermUUID;
                this.bedesTermService.getTerm(uuid)
                .subscribe((bedesTerm: BedesTerm | BedesConstrainedList) => {
                    this.mappedTerm = bedesTerm;
                    this.gridDataNeedsSet = true;
                    this.setGridData();
                });
            }
            else if (this.appTerm.mapping instanceof TermMappingComposite) {
                uuid = this.appTerm.mapping.compositeTermUUID
                this.compositeTermService.getTerm(uuid)
                .subscribe((compositeTerm: BedesCompositeTerm) => {
                    this.mappedTerm = compositeTerm;
                    this.gridDataNeedsSet = true;
                    this.setGridData();
                })
            }
        }
        else {
            this.mappedTerm = undefined;
        }
    }

    /**
     * Transforms the current appTerm either from:
     * 1) AppTerm -> AppTermList
     * 2) AppTermList -> AppTerm
     *
     * When the drop down list term type changes,
     * this handler is called to.
     */
    private transFormAppTerm(): void {
        if (this.appTerm.termTypeId === TermType.Atomic && this.appTerm instanceof AppTermList) {
            // transfrom the term
            this.appTermListToAppTerm();
            // update the service's BehaviorSubject to notify subscribers
            this.appTermService.setActiveTerm(this.appTerm);
        }
        else if (this.appTerm.termTypeId === TermType.ConstrainedList && !(this.appTerm instanceof AppTermList)) {
            this.appTermToList();
            this.appTermService.setActiveTerm(this.appTerm);
        }
    }

    /**
     * Transform the current appTerm, which should be an AppTerm object,
     * into an AppTermList object.
     */
    private appTermToList(): void {
        if (this.appTerm instanceof AppTerm) {
            const listInterface: IAppTermList = this.appTerm.toInterface();
            if (this.listOptionHold) {
                listInterface._listOptions = this.listOptionHold;
                this.listOptionHold = undefined;
            }
            this.appTerm = new AppTermList(listInterface);
        }
    }
    /**
     * Transform the current appTerm, which should be an AppTerm object,
     * into an AppTermList object.
     */
    private appTermListToAppTerm(): void {
        if (this.appTerm instanceof AppTermList) {
            const termInterface: IAppTermList = this.appTerm.toInterface();
            // Hold the list options just incase
            this.listOptionHold = termInterface._listOptions;
            this.appTerm = new AppTerm(termInterface);
        }
    }

    /**
     * Calls the api to save/update the AppTerm record.
     */
    public saveAppTerm(): void {
        if (this.appTerm.id) {
            // update the AppTerm if there's an id
            this.updateAppTerm();
        }
        else {
            // otherwise create a new AppTerm
            this.saveNewAppTerm();
        }
    }

    /**
     * Saves a new AppTerm.
     */
    private saveNewAppTerm(): void {
        this.resetError();
        // call the backend service
        this.appTermService.newAppTerm(this.app.id, this.appTerm)
        .subscribe((newTerm: AppTerm) => {
            this.handleSaveNewAppTermSuccess(newTerm);
            // set the newTerm as the active term and change the route
            // this.appTermService.setActiveTerm(this.appTerm);
            // this.appTermService.refreshActiveTerms();
            // notify the appTerm service that the term list should be refreshed

            // add the new term to the current list of terms
        }, (error: any) => {
            this.setErrorMessage(error);
        });
    }

    private handleSaveNewAppTermSuccess(newTerm: AppTerm): void {
        // update the existing AppTerm object.
        AppTerm.updateObjectValues(newTerm, this.appTerm);
        this.appTermService.termListNeedsRefresh = true;
        this.appTerm.clearChangeFlag();
        this.appTermService.addAppTermToList(this.appTerm);
        this.appTermService.setActiveTerm(this.appTerm);
        this.authService.checkLoginStatus()
        .subscribe((currentUser: CurrentUser) => {
            this.router.navigate(['..', this.appTerm.uuid], {relativeTo: this.route})
        })

    }

    /**
     * Update an existing AppTerm.
     *
     * First resets the error, then updates the term with the backend.
     */
    private updateAppTerm(): void {
        this.resetError();
        // call the backend service
        this.appTermService.updateAppTerm(this.app.id, this.appTerm)
        .subscribe((updatedTerm: AppTerm) => {
            this.appTerm.clearChangeFlag();
        }, (error: any) => {
            this.setErrorMessage(error);
        });
    }

    /**
     * Set the form data from the active AppTerm.
     */
    private setFormData(): void {
        // Application name
        this.dataForm.controls['name'].setValue(
            this.appTerm ? this.appTerm.name : ''
        );
        // Description
        this.dataForm.controls['description'].setValue(
            this.appTerm ? this.appTerm.description : ''
        );
        // Unit
        this.dataForm.controls['unit'].setValue(
            this.appTerm ? this.appTerm.unit : ''
        );
        // uuid
        this.dataForm.controls['uuid'].setValue(
            this.appTerm ? this.appTerm.uuid: ''
        );
        // TermType - value or constrained list
        this.dataForm.controls['termTypeId'].setValue(
            this.appTerm ? this.appTerm.termTypeId : ''
        );
        // Data Type
        this.dataForm.controls['dataTypeId'].setValue(
            this.appTerm ? this.appTerm.dataTypeId : ''
        );
    }

    /**
     * Subscribe to the form field changes observable, so changes
     * to values in the html inputs update the model.
     */
    private subscribeToFormChanges(): void {
        // Name changes
        this.dataForm.controls['name'].valueChanges
        .subscribe(() => {
            this.appTerm.name = this.dataForm.controls.name.value;
        });
        // Description changes
        this.dataForm.controls['description'].valueChanges
        .subscribe((newValue: string) => {
            this.appTerm.description = newValue;
        });
        this.dataForm.controls['unit'].valueChanges
        .subscribe((newValue: string) => {
            this.appTerm.unit = newValue;
        });
        // term type changes
        this.dataForm.controls['termTypeId'].valueChanges
        .subscribe((newValue: number) => {
            this.appTerm.termTypeId = newValue;
            // switch the app terms object type
            this.transFormAppTerm();
        });
        // Data Type changes
        this.dataForm.controls['dataTypeId'].valueChanges
        .subscribe((newValue: number) => {
            this.appTerm.dataTypeId = newValue;
            // switch the app terms object type
            this.transFormAppTerm();
        });
    }

    private getAppTermFromForm(): IAppTerm {
        const newItem: IAppTerm = {
            _name: this.dataForm.value.name,
            _description: this.dataForm.value.description,
            _termTypeId: this.dataForm.value.termTypeId,
            _dataTypeId: this.dataForm.value.dataTypeId,
            _unit: this.dataForm.value.unit,
            _uuid: this.dataForm.value.uuid

        };
        return newItem;
    }

    /**
     * Set's the error message from the response error.
     */
    private setErrorMessage(error: any): void {
        if (error && error.status === HttpStatusCodes.BadRequest_400 && error.error) {
            this.errorMessage = error.error;
        }
        else {
            this.errorMessage = "An unknown error occured, application term not created."
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
     * Setup the ag-grid
     */
    private gridSetup(): void {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                sortable: true,
                resizable: true,
                filter: true,
            },
            enableRangeSelection: true,
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
                const rows = event.api.getSelectedRows();
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
                cellRendererFramework: TableCellNavComponent,
                // minWidth: 250,
                // cellRendererFramework: TableCellNameNavComponent
            },
            {
                headerName: 'BEDES Option Mapping',
                field: 'mappedName',
                cellRendererFramework: TableCellMapListOptionComponent
            },
            {
                headerName: '',
                width: 50,
                cellRendererFramework: TableCellDeleteComponent
            },
        ];
    }

    /**
     * Populates the grid with the data from the appTermList
     */
    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsSet) {
            // const gridData = this.applicationList;
            const gridData = new Array<IGridRow>();
            const canEditApp = this.currentUser.canEditApplication(this.app);
            const shouldShowMappingButtons = this.isMappedToConstrainedList();
            if (this.appTerm instanceof AppTermList && this.appTerm.listOptions.length) {
                this.appTerm.listOptions.forEach((item: AppTermListOption) => {
                    gridData.push(<IGridRow>{
                        ref: item,
                        showMappingButtons: shouldShowMappingButtons,
                        hasMapping: item.mapping && item.mapping.bedesTermOptionUUID ? true : false,
                        mappedName: item.mapping && item.mapping.bedesOptionName? item.mapping.bedesOptionName : '',
                        isEditable: canEditApp
                    })
                })
            }
            this.gridOptions.api.setRowData(gridData);
            this.gridDataNeedsSet = false;
        }
    }

    /**
     * Determines if the current AppTerm is a ConstrainedList.
     * @returns true if the current AppTerm is a constrained list.
     */
    public isTermList(): boolean {
        return this.appTerm && this.appTerm.termTypeId === TermType.ConstrainedList
            ? true
            : false;
    }

    /**
     * Determines how many list options are in the current AppTerm.
     * @returns true if term list items
     */
    public numberTermListItems(): number {
        return this.appTerm instanceof AppTermList
            ? this.appTerm.listOptions.length
            : 0;

    }

    /**
     * Determines if the current AppTerm is mapped to a Bedes Constrained List.
     * @returns true if mapped to constrained list
     */
    public isMappedToConstrainedList(): boolean {
        if (
            this.appTerm
            && (
                (
                    this.appTerm.mapping instanceof TermMappingAtomic
                    && this.appTerm.mapping.bedesTermType === TermType.ConstrainedList
                )
                ||
                (
                    this.appTerm.mapping instanceof TermMappingComposite
                    && this.mappedTerm && this.mappedTerm.isConstrainedList()
                )
            )
        ) {
            return true;
        }
        else {
            return false;
        }
    }

    public isMappedToCompositeTerm(appTerm: AppTerm | AppTermList) {
        return appTerm && appTerm.mapping && appTerm.mapping instanceof TermMappingComposite && appTerm.mapping.compositeTermUUID;
    }

    public getDataTypeName(dataTypeId: number) {
        const bedesDataType = this.dataTypeItems.find(value => value.id === dataTypeId);

        if (!bedesDataType) {
            return '';
        }

        return bedesDataType.name;
    }

    public getUnitName(unitId: number) {
        const bedesUnit = this.unitList.find(value => value.id === unitId);

        if (!bedesUnit) {
            return '';
        }

        return bedesUnit.name;
    }

    public getScopeName(scopeId: number) {
        if (!scopeId) {
            return '';
        }

        const scopeName = scopeList.getItemById(scopeId).name;
        return scopeName ?? '';
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
     * Processes a message from a grid.
     */
    public messageFromGrid(messageType: TableCellMessageType, selectedRow: IGridRow): void {
        const listOption = selectedRow ? selectedRow.ref : undefined;

        if (listOption) {
            if (messageType === TableCellMessageType.View) {
                this.editListOption(listOption);
            }
            else if (messageType === TableCellMessageType.Remove) {
                this.confirmRemoveListOption(listOption);
            }
        }
    }

    /**
     * Receives a message from the mapped BEDES term grid cell.
     *
     * TODO: refactor message passing between grid and parent component
     */
    public mappingMessageFromGrid(messageType: MappingTableMessageType, selectedRow: IGridRow): void {
        const listOption = selectedRow ? selectedRow.ref : undefined;

        if (listOption) {
            if (messageType === MappingTableMessageType.AssignMapping) {
                this.listOptionMapping(listOption);
            }
            else if (messageType === MappingTableMessageType.ClearMapping) {
                this.confirmClearMapping(listOption);
            }
        }
    }

    /**
     * Determines if the list option grid should currently be displayed.
     *
     * @returns True if the list option grid should be visible, false otherwise.
     */
    public shouldShowListOptionGrid(): boolean {
        return this.currentViewState === OptionViewState.ListOptionsView;
    }

    // list option methods
    /**
     * Displays a new listOption view for creating new
     * AppTermListOpion objects.
     */
    public newListOption(): void {
        // set the current active list option
        this.getNewListOption()
        .subscribe((newListOption: AppTermListOption | undefined) => {
            if (newListOption) {
                (<AppTermList>this.appTerm).addListOption(newListOption);
                this.gridDataNeedsSet = true;
                this.setGridData();
            }
        });
    }

    private getNewListOption(): Observable<AppTermListOption | undefined> {
        const dialogRef = this.dialog.open(NewListOptionDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '450px',
            position: {top: '20px'},
            data: {
            }
        });
        return dialogRef.afterClosed()
        .pipe(
            switchMap((result: INewListOption) => {
                if (result) {
                    return of(new AppTermListOption({_name: result.name, _description: result.description}));
                }
                else {
                    return of(undefined);
                }
            })
        )
    }

    /**
     * Change the list option view state back to the main grid.
     */
    public backToListView(): void {
        this.gridDataNeedsSet = true;
        this.listOptionService.setActiveListOption(undefined);
        this.currentViewState = OptionViewState.ListOptionsView;
    }

    /**
     * Determines if the "new list option" view should be displayed.
     *
     * @returns true if the display should be visible, false otherwise.
     */
    public shouldShowNewListOption(): boolean {
        return this.currentViewState === OptionViewState.ListOptionsNew
            || this.currentViewState === OptionViewState.ListOptionsEdit;
    }

    /**
     * Opens the edit view for an AppTermListOption.
     *
     * @param listOption The AppTermListOption to edit
     */
    public editListOption(listOption: AppTermListOption): void {
        this.activeListOption = listOption;
        if (listOption) {
            this.listOptionService.setActiveListOption(this.activeListOption);
            this.currentViewState = OptionViewState.ListOptionsEdit;
        }
    }

    /**
     * Confirm the removal of an AppTerm before calling the backend API.
     */
    private confirmRemoveListOption(listOption: AppTermListOption): void {
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
                this.removeListOption(listOption);
            }
        });
    }

    /**
     * Open a confirm dialog when clearing out term mappings.
     */
    public confirmClearMapping(listOption?: AppTermListOption): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '450px',
            position: {top: '20px'},
            data: {
                dialogTitle: 'Confirm?',
                dialogContent: 'Remove the selected terms?',
            }
        });
        dialogRef.afterClosed()
        .subscribe((results: boolean) => {
            if (results) {
                this.clearMapping(listOption);
            }
        });
    }

    /**
     * Clear the term mapping, notify all service subscribers of the active term update.
     */
    private clearMapping(listOption?: AppTermListOption): void {
        if (listOption) {
            listOption.mapping = undefined;
        }
        else {
            this.appTerm.mapping = undefined;
        }
        this.appTermService.activeTermSubject.next(this.appTerm);
        this.gridDataNeedsSet = true;
        this.setGridData();
    }

    /**
     * Use the service to remove the list option.
     */
    public removeListOption(listOption: AppTermListOption): void {
        // make sure we're getting an AppTermList
        if (!(this.appTerm instanceof AppTermList)) {
            throw new Error('AppTermList expected when removing AppTermListOption');
        }
        this.listOptionService.deleteListOption(this.appTerm, listOption)
        .subscribe(
            (results: boolean) => {
                // refresh the activeTerm if context is still the same object.
                if (this.appTermService.activeTerm === this.appTerm) {
                    this.appTermService.activeTermSubject.next(this.appTerm);
                }
            },
            (error: any) => {
                this.hasError = true;
                this.errorMessage = "An error occurred removing the application.";
            });
    }

    /**
     * Open the dialog to assign the BEDES List options.
     */
    public listOptionMapping(listOption: AppTermListOption): void {
        if (
            !this.appTerm
            || !this.appTerm.isConstrainedList()
            || !this.mappedTerm
            || !this.mappedTerm.isConstrainedList()
        ) {
            throw new Error('A BedesConstrainedList term is required.');
        }

        /** subscriber function for handling the selected mapped option */
        const subscriberFunction = (selectedOption: BedesTermOption) => {
            if (selectedOption) {
                this.setMappedListOption(listOption, selectedOption);
            }
        }

        if (this.mappedTerm instanceof BedesCompositeTerm) {
            // handle composite terms
            const lastItem = this.mappedTerm.getLastDetailItem();
            if (lastItem) {
                this.bedesTermService.getTerm(lastItem.term.uuid)
                .subscribe((term: BedesTerm | BedesConstrainedList) => {
                    if (term instanceof BedesConstrainedList) {
                        this.getMappedOptionFromDialog(term)
                        .subscribe(subscriberFunction);
                    }
                })
            }
        }
        else if (this.mappedTerm instanceof BedesConstrainedList) {
            this.getMappedOptionFromDialog(this.mappedTerm)
            .subscribe(subscriberFunction);
        }
    }

    private getMappedOptionFromDialog(term: BedesConstrainedList): Observable<BedesTermOption> {
        const dialogRef = this.dialog.open(ListOptionMapDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '650px',
            position: {top: '20px'},
            data: {
                constrainedList: term,
                dialogContent: 'Remove the selected terms?',
            }
        });
        return dialogRef.afterClosed();

    }

    /**
     * Open the dialog to import the mapped BEDES term.
     */
    public openTermSearchDialog(): void {
        // open the dialog
        const dialogRef = this.dialog.open(BedesTermSearchDialogComponent, {
            panelClass: 'dialog-content-flex',
            width: '95%',
            height: '95%',
            data: <ISearchDialogOptions>{
                showOnlyUUID: true
            }
        });
        // After the dialog is close...
        dialogRef.afterClosed()
        .subscribe((results: Array<BedesSearchResult> | undefined) => {
            if (Array.isArray(results) && results.length) {
                this.setMappedTermFromSearchResult(results[0]);
            }
        });
    }

    /**
     * Set's the BEDES term from a BedesSearchResult object.
     */
    private setMappedTermFromSearchResult(searchResult: BedesSearchResult): void {
        if (searchResult.resultObjectType === SearchResultType.CompositeTerm) {
            this.setMappedCompositeTerm(searchResult);
        }
        else {
            this.setMappedAtomicTerm(searchResult);
        }
    }

    /**
     * Maps the active AppTerm to the composite term search result.
     */
    private setMappedCompositeTerm(searchResult: BedesSearchResult): void {
        // only handle composite term requests
        if (searchResult.resultObjectType !== SearchResultType.CompositeTerm) {
            throw new Error('CompositeTerm expected in setMappedCompositeTerm');
        }
        // make sure to get the uuid of the term and not the list option
        this.compositeTermService.getTerm(searchResult.uuid)
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            // received the compositeTerm
            if (this.appTerm instanceof AppTermList) {
                // if this is an appTermList include the activeListOption
                this.appTerm.map(compositeTerm, undefined, this.activeListOption);
            }
            else {
                this.appTerm.map(compositeTerm);

            }
            this.appTermService.activeTermSubject.next(this.appTerm);
            this.gridDataNeedsSet = true;
            this.setGridData();
        })

    }

    /**
     * Set's the mapped term to a atomic term from a given searchResult.
     */
    private setMappedAtomicTerm(searchResult: BedesSearchResult): void {
        // don't handle composite term requests
        if (searchResult.resultObjectType === SearchResultType.CompositeTerm) {
            throw new Error('setMappedAtomicTerm expected to map an atomic term, composite term found');
        }
        // make sure to get the uuid of the term and not the list option
        const termUUID = searchResult.termUUID ? searchResult.termUUID : searchResult.uuid;
        // get the listOption UUID if there is one
        const optionUUID = searchResult.termUUID && searchResult.uuid ? searchResult.uuid : undefined;
        // get the atomic term from the backend
        this.bedesTermService.getTerm(termUUID)
        .subscribe((bedesTerm: BedesTerm | BedesConstrainedList) => {
            this.mappedTerm = bedesTerm;
            // holds the reference to the mapped BedesTermOption, if applicable
            let bedesTermOption: BedesTermOption | undefined;
            if(optionUUID && bedesTerm instanceof BedesConstrainedList) {
                // find the matching listOption by UUID
                const found = bedesTerm.options.find((item) => item.uuid === optionUUID);
                if (found) {
                    // assign the bedesListOption if there is one
                    bedesTermOption = found;
                }
                else {
                    throw new Error(`Couldn't find term ${optionUUID}`)
                }
            }
            if (this.appTerm instanceof AppTermList) {
                // if this is an appTermList include the activeListOption
                this.appTerm.map(bedesTerm, bedesTermOption, this.activeListOption);
            }
            else {
                this.appTerm.map(bedesTerm, bedesTermOption);

            }
            // notify subscribers
            this.appTermService.activeTermSubject.next(this.appTerm);
            this.gridDataNeedsSet = true;
            this.setGridData();
        }, (error: any) => {
        });
    }

    /**
     * Set's the mapping on the active list option to the bedesTermOption parameter.
     */
    private setMappedListOption(appTermOption: AppTermListOption, bedesTermOption: BedesTermOption): void {
        // map the bedesTerm
        appTermOption.map(bedesTermOption);
        this.appTerm.hasChanged = true;
        this.appTermService.activeTermSubject.next(this.appTerm);
        this.gridDataNeedsSet = true;
        this.setGridData();
    }

}
