import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { ApplicationService } from '../../../../services/application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application/mapping-application';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { ApplicationScope } from '@bedes-common/enums/application-scope.enum';
import { AppTermService } from '../../../../services/app-term/app-term.service';
import { AppTerm, AppTermList, AppTermListOption, IAppTerm, IAppTermList, IAppTermListOption } from '@bedes-common/models/app-term';
import { appTermTypeList } from '@bedes-common/lookup-tables/app-term-type-list';
import { takeUntil } from 'rxjs/operators';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { OptionViewState } from 'src/app/modules/bedes/models/list-options/option-view-state.enum';
import { SupportListService } from '../../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { TableCellAppTermNavComponent } from '../../app-term-list/table-cell-app-term-nav/table-cell-app-term-nav.component';
import { TableCellMessageType } from '../../app-term-list/table-cell-message-type.enum';
import { AppTermListOptionService } from '../../../../services/app-term-list-option/app-term-list-option.service';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '../../../dialogs/confirm-dialog/confirm-dialog.component';
import { BedesTermSearchDialogComponent } from '../../../dialogs/bedes-term-search-dialog/bedes-term-search-dialog.component';
import { ISearchDialogOptions } from '../../../dialogs/bedes-term-search-dialog/search-dialog-options.interface';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';
import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';
import { BedesTerm } from '@bedes-common/models/bedes-term/bedes-term';
import { TermMappingComposite } from '@bedes-common/models/term-mapping/term-mapping-composite';
import { CompositeTermService } from '../../../../services/composite-term/composite-term.service';
import { BedesTermService } from '../../../../services/bedes-term/bedes-term.service';
import { TermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic';
import { TableCellMapListOptionComponent } from '../table-cell-map-list-option/table-cell-map-list-option.component';
import { MappingTableMessageType } from '../mapping-table-message-type.enum';
import { ListOptionMapDialogComponent } from '../../../dialogs/list-option-map-dialog/list-option-map-dialog.component';
import { BedesTermOption } from '../../../../../../../../../bedes-common/models/bedes-term-option/bedes-term-option';
import { TermMappingListOption } from '../../../../../../../../../bedes-common/models/term-mapping/term-mapping-list-option';


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
    // Holds the current term type selected in the dropdown
    public currentTermType: TermType;
    // Enum for TermType
    public TermType = TermType;
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
        unitId: [''],
        uuid: [{
            value: null,
            disabled: true
        }],
        termTypeId: [null, Validators.required]
    });

    public stateChangeSubject: BehaviorSubject<OptionViewState>;
    public currentViewState: OptionViewState;

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
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        // set some grid initialization variables
        this.gridDataNeedsSet = true;
        this.gridInitialized = false;
        // set the current list option view
        this.currentViewState = OptionViewState.ListOptionsView;
        this.initializeSupportLists();
        this.subscrbeToMappingApplication();
        this.subscribeToActiveTerm();
        this.subscribeToFormChanges();
        this.gridSetup();
        this.setTableContext();
        this.initializeStateChanges();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the active MappingApplication object.
     */
    private subscrbeToMappingApplication(): void {
        this.appService.selectedItemSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((app: MappingApplication) => {
                this.app = app;
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
                    this.setNewAppTerm();
                }
                // set the form data
                this.setFormData();
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
                console.log(`${this.constructor.name}: receceived unit list`, results);
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

    /**
     * Assign a new instance of AppTerm to the appTerm object,
     * we're creating a new appTerm.
     */
    private setNewAppTerm(): void {
        const params: IAppTerm = {
            _name: 'New Mapping Application Term',
            _termTypeId: TermType.Atomic
        }
        this.appTerm = new AppTerm(params);
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
     * Save a new AppTerm.
     */
    private saveNewAppTerm(): void {
        console.log(`${this.constructor.name}: app term, `, this.appTerm);
        this.resetError();
        // call the backend service
        this.appTermService.newAppTerm(this.app.id, this.appTerm)
        .subscribe((newTerm: AppTerm) => {
            console.log('successfully created the new appTerm',  newTerm)
            this.appTerm.id = newTerm.id;
            this.appTermService.setActiveTerm(this.appTerm);
            this.router.navigate(['..', this.appTerm.id], {relativeTo: this.route});
        }, (error: any) => {
            console.log('Error saving appTerm', error);
            this.setErrorMessage(error);
        });
    }

    /**
     * Update an existing AppTerm.
     *
     * First resets the error, then updates the term with the backend.
     */
    private updateAppTerm(): void {
        console.log(`${this.constructor.name}: update app term, `, this.appTerm);
        this.resetError();
        // update the term with the form data
        this.setFormData();
        // call the backend service
        this.appTermService.updateAppTerm(this.app.id, this.appTerm)
        .subscribe((updatedTerm: AppTerm) => {
            console.log('successfully updated the appTerm',  updatedTerm)
            // this.appTerm.id = newTerm.id;
            // this.appTermService.setActiveTerm(this.appTerm);
            // this.router.navigate(['..', this.appTerm.id], {relativeTo: this.route});
        }, (error: any) => {
            console.log('Error saving appTerm', error);
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
        // UnitId
        this.dataForm.controls['unitId'].setValue(
            this.appTerm ? this.appTerm.unitId : ''
        );
        // uuid
        this.dataForm.controls['uuid'].setValue(
            this.appTerm ? this.appTerm.uuid: ''
        );
        // TermType - value or constrained list
        this.dataForm.controls['termTypeId'].setValue(
            this.appTerm ? this.appTerm.termTypeId : ''
        );


    }

    /**
     * Updates the active MappingApplication object with the
     * values from the dataForm.
     */
    private updateTermFromForm(): void {
        const values = this.getAppTermFromForm();
        console.log('values', values);
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
        this.dataForm.controls['unitId'].valueChanges
        .subscribe((newValue: number) => {
            this.appTerm.unitId = newValue;
        });
        // term type changes
        this.dataForm.controls['termTypeId'].valueChanges
        .subscribe((newValue: number) => {
            console.log(`new value = ${newValue} type = ${typeof newValue}`)
            this.appTerm.termTypeId = newValue;
            console.log(this.appTerm);
            // switch the app terms object type
            this.transFormAppTerm();
        });
    }

    private getAppTermFromForm(): IAppTerm {
        const newItem: IAppTerm = {
            _name: this.dataForm.value.name,
            _description: this.dataForm.value.description,
            _termTypeId: this.dataForm.value.termTypeId,
            _unitId: this.dataForm.value.unitId,
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
                // this.selectedItem = rows && rows.length ? rows[0] : undefined;
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
                cellRendererFramework: TableCellAppTermNavComponent,
                // minWidth: 250,
                // cellRendererFramework: TableCellNameNavComponent
            },
            {
                headerName: 'BEDES Option Mapping',
                field: 'mappedName',
                cellRendererFramework: TableCellMapListOptionComponent
            }
        ];
    }

    /**
     * Populates the grid with the data from the appTermList
     */
    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsSet) {
            // const gridData = this.applicationList;
            const gridData = new Array<IGridRow>();
            // this.appTermList.forEach((app: AppTerm | AppTermList) => {
            //     gridData.push(<IGridRow>{
            //         ref: app,
            //         mappedBedesTerm: {name: 'Some mapped BEDES Term'}
            //     });
            // })
            const shouldShowMappingButtons = this.shouldShowMappingButtons();
            if (this.appTerm instanceof AppTermList && this.appTerm.listOptions.length) {
                this.appTerm.listOptions.forEach((item: AppTermListOption) => {
                    console.log(item);
                    console.log(item.mapping && item.mapping.listOption ? item.mapping.listOption.name : '');
                    gridData.push(<IGridRow>{
                        ref: item,
                        showMappingButtons: shouldShowMappingButtons,
                        hasMapping: item.mapping && item.mapping.listOption ? true : false,
                        mappedName: item.mapping && item.mapping.listOption ? item.mapping.listOption.name : ''
                    })
                })
            }
            this.gridOptions.api.setRowData(gridData);
            console.log('grid data');
            console.log(gridData);
            this.gridDataNeedsSet = false;
        }
    }

    public shouldShowMappingButtons(): boolean {
        if (this.appTerm
            && this.appTerm.mapping instanceof TermMappingAtomic
            && this.appTerm.mapping.bedesTerm instanceof BedesConstrainedList
        ) {
            return true;
        }
        else {
            return false;
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
     * Processes a message from a grid.
     */
    public messageFromGrid(messageType: TableCellMessageType, selectedRow: IGridRow): void {
        console.log(`${this.constructor.name}: received grid message`, messageType, selectedRow);
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
        console.log(`${this.constructor.name}: received grid message`, messageType, selectedRow);
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
    public  newListOption(): void {
        // set the current active list option
        this.activeListOption = new AppTermListOption(
            <IAppTermListOption>{
            _name: 'New List Option'
        });
        // set the active list option
        this.listOptionService.setActiveListOption(this.activeListOption);
        // chnage the list option view state
        this.currentViewState = OptionViewState.ListOptionsNew;
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
                console.log(`${this.constructor.name}: received results`);
                console.log(results);
                // refresh the activeTerm if context is still the same object.
                if (this.appTermService.activeTerm === this.appTerm) {
                    this.appTermService.activeTermSubject.next(this.appTerm);
                }
            },
            (error: any) => {
                console.log('Error removing MappingApplication', listOption);
                console.log(error);
                this.hasError = true;
                this.errorMessage = "An error occurred removing the application.";
            });
    }

    /**
     * Open the dialog to assign the BEDES List options.
     */
    public listOptionMapping(listOption: AppTermListOption): void {
        console.log(listOption);
        console.log(this.appTerm.mapping);
        if (!(this.appTerm
            && this.appTerm.mapping
            && this.appTerm.mapping instanceof TermMappingAtomic
            && this.appTerm.mapping.bedesTerm instanceof BedesConstrainedList
        )) {
            throw new Error('A BedesConstrainedList term is required.');
        }
        const sourceList = this.appTerm.mapping.bedesTerm.options;
        const dialogRef = this.dialog.open(ListOptionMapDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '650px',
            position: {top: '20px'},
            data: {
                constrainedList: this.appTerm.mapping.bedesTerm,
                dialogContent: 'Remove the selected terms?',
            }
        });
        dialogRef.afterClosed().subscribe((selectedOption: BedesTermOption) => {
            console.log(selectedOption);
            if (selectedOption) {
                this.setMappedListOption(listOption, selectedOption);
            }
        });
    }

    /**
     * Open the dialog to import the mapped BEDES term.
     */
    public openTermSearchDialog(): void {
        // open the dialog
        const dialogRef = this.dialog.open(BedesTermSearchDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '80%',
            position: {top: '20px'},
            data: <ISearchDialogOptions>{
                // excludeResultType: [SearchResultType.CompositeTerm],
                // excludeUUID: this.compositeTerm.items.map((d) => d.term.uuid),
                showOnlyUUID: true
            }
        });
        // After the dialog is close...
        dialogRef.afterClosed()
        .subscribe((results: Array<BedesSearchResult> | undefined) => {
            console.log('dialogRef.afterClosed()', results);
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
        this.compositeTermService.getTerm(searchResult.id)
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            // received the compositeTerm
            console.log(`${this.constructor.name}: received the compositeTerm`);
            // create the new mapping object and assign it to the active appTerm
            const mapping = new TermMappingComposite()
            this.appTerm.mapping = mapping;
            // assign the active AppTermListOption if it's set
            if (this.activeListOption) {
                mapping.appListOption = this.activeListOption;
            }
            // assign the bedesTerm
            mapping.compositeTerm = compositeTerm;
            this.appTermService.activeTermSubject.next(this.appTerm);
            this.gridDataNeedsSet = true;
            this.setGridData();
            console.log('done', mapping);
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
            // create the new mapping object and assign it to the active appTerm
            const mapping = new TermMappingAtomic()
            this.appTerm.mapping = mapping;
            // assign the active AppTermListOption if it's set
            if (this.activeListOption) {
                mapping.appListOption = this.activeListOption;
            }
            // assign the bedesTerm
            mapping.bedesTerm = bedesTerm;
            // assign the listOption to the mapping
            if(optionUUID && bedesTerm instanceof BedesConstrainedList) {
                // find the matching listOption by UUID
                const found = bedesTerm.options.find((item) => item.uuid === optionUUID);
                if (found) {
                    // assign the bedesListOption if there is one
                    mapping.bedesListOption = found;
                }
                else {
                    throw new Error(`Couldn't find term ${optionUUID}`)
                }
            }
            this.appTermService.activeTermSubject.next(this.appTerm);
            this.gridDataNeedsSet = true;
            this.setGridData();
            console.log('done', mapping);
        }, (error: any) => {
            console.error(`${this.constructor.name}: error mapping the atomic term`, error);
        });
    }

    /**
     * Set's the mapping on the active list option to the bedesTermOption parameter.
     */
    private setMappedListOption(appTermOption: AppTermListOption, bedesTermOption: BedesTermOption): void {
        appTermOption.mapping = new TermMappingListOption();
        appTermOption.mapping.listOption = bedesTermOption;
        this.appTermService.activeTermSubject.next(this.appTerm);
        this.gridDataNeedsSet = true;
        this.setGridData();
        console.log(appTermOption);
    }

}
