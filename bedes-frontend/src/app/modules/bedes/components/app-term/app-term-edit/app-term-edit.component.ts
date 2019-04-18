import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ApplicationService } from '../../../services/application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application/mapping-application';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { ApplicationScope } from '@bedes-common/enums/application-scope.enum';
import { AppTermService } from '../../../services/app-term/app-term.service';
import { AppTerm, AppTermList, AppTermListOption } from '@bedes-common/models/app-term';
import { appTermTypeList } from '@bedes-common/lookup-tables/app-term-type-list';
import { takeUntil } from 'rxjs/operators';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { Scope } from '@bedes-common/enums/scope.enum';


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
    ref: AppTermListOption
}



@Component({
  selector: 'app-app-term-edit',
  templateUrl: './app-term-edit.component.html',
  styleUrls: ['./app-term-edit.component.scss']
})
export class AppTermEditComponent implements OnInit {
    // The active MappingApplication object.
    public app: MappingApplication;
    // The active MappingApplication's AppTerms
    public termList: Array<AppTerm | AppTermList>;
    public appTerm: AppTerm | AppTermList | undefined;
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

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: [''],
        termTypeId: [null, Validators.required]
    });

    constructor(
        private formBuilder: FormBuilder,
        private appService: ApplicationService,
        private appTermService: AppTermService
    ) { }

    ngOnInit() {
        this.gridDataNeedsSet = true;
        this.gridInitialized = false;
        this.subscrbeToApplicationData();
        this.subscribeToActiveTerm();
        this.subscribeToFormChanges();
        this.gridSetup();
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
                // this.setFormData();
            });
    }

    /**
     * Subscribe to the BehaviorSubject that serves the
     * active Mapping Application's set of AppTerms.
     */
    private subscribeToActiveTerm(): void {
        console.log('subscribe to the active AppTerm')
        this.appTermService.activeTermSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((activeTerm: AppTerm | AppTermList | undefined) => {
                console.log(`${this.constructor.name}: received activeTerm`, activeTerm);
                this.appTerm = activeTerm;
                this.setFormData();
            });
    }

    /**
     * Calls the api to update the MappingApplication record.
     */
    public updateAppTerm(): void {
        console.log(`${this.constructor.name}: update app term`);
        // const newApp: IMappingApplication = this.getAppFromForm();
        // newApp._id = this.app.id;
        // console.log(`${this.constructor.name}: update mapping application`, newApp);
        // this.resetError();
        // this.appService.updateApplication(newApp)
        // .subscribe(
        //     (newApp: MappingApplication) => {
        //         // application successfully created
        //         console.log(`${this.constructor.name}: create new App success`, newApp);
        //         // update the MappingApplication object with the new properties
        //         this.app.name = newApp.name;
        //         this.app.description = newApp.description;
        //         this.currentControlState = ControlState.FormSuccess;
        //         this.currentRequestStatus = RequestStatus.Success;
        //     },
        //     (error: any) => {
        //         console.log(`${this.constructor.name}: Error creating new application`, error);
        //         this.setErrorMessage(error);
        //     }
        // );
    }

    /**
     * Set the form data from the active MappingApplication.
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
        // Term Type
        this.dataForm.controls['termTypeId'].setValue(
            this.appTerm ? this.appTerm.termTypeId : ''
        );


    }

    /**
     * Updates the active MappingApplication object with the
     * values from the dataForm.
     */
    private updateApplicationFromForm(): void {
        const values = this.getAppFromForm();
    }

    /**
     * Subscribe to the form fields
     *
     * @private
     * @memberof AppTermEditComponent
     */
    private subscribeToFormChanges(): void {
        this.dataForm.controls['termTypeId'].valueChanges
        .subscribe(() => {
            console.log(this.dataForm.controls.termTypeId.value);
        });
    }

    /**
     * Return an IApp object using the current values from the dataForm.
     */
    private getAppFromForm(): IMappingApplication {
        const newApp: IMappingApplication = {
            _name: this.dataForm.value.name,
            _description: this.dataForm.value.description,
            _scopeId: ApplicationScope.Private
        };
        return newApp;

    }

    /**
     * Set's the error message from the response error.
     */
    private setErrorMessage(error: any): void {
        if (error && error.status === HttpStatusCodes.BadRequest_400 && error.error) {
            this.errorMessage = error.error;
        }
        else {
            this.errorMessage = "An unknown error occured, application not created."
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
                checkboxSelection: true
                // minWidth: 250,
                // cellRendererFramework: TableCellNameNavComponent
            },
            {
                headerName: 'Description',
                field: 'ref.description'
            },
            {
                headerName: 'Unit',
                field: 'ref.unitId'
            },
            {
                headerName: 'Mapped BEDES Term Name',
                field: 'mappedBedesTerm.name'
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
            if (this.appTerm instanceof AppTermList && this.appTerm.listOptions.length) {
                this.appTerm.listOptions.forEach((item: AppTermListOption) => {
                    gridData.push(<IGridRow>{
                        ref: item
                    })
                })
            }
            this.gridOptions.api.setRowData(gridData);
            this.gridDataNeedsSet = false;
        }
    }

}

