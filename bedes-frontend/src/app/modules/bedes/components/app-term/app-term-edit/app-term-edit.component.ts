import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
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
import { GridApi, GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { Scope } from '@bedes-common/enums/scope.enum';
import { ActivatedRoute, UrlSegment } from '@angular/router';


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
    /** Indicates if the current term is new term */
    public isNewTerm = false;
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
    private gridApi: GridApi | null = null;
    public gridData: Array<IGridRow>;
    public tableContext: any;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: [''],
        termTypeId: [null, Validators.required]
    });

    constructor(
        private route: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private appService: ApplicationService,
        private appTermService: AppTermService
    ) { }

    ngOnInit() {
        this.gridDataNeedsSet = true;
        this.gridInitialized = false;
        this.setRouteData();
        this.setIsNewTerm();
        this.subscrbeToApplicationData();
        if (!this.isNewTerm) {
            this.subscribeToActiveTerm();
        }
        this.subscribeToFormChanges();
        this.gridSetup();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private setRouteData(): void {
        this.route.data
        .subscribe((data: any) => {
            this.appTerm = data;
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
        this.appTermService.activeTermSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((activeTerm: AppTerm | AppTermList | undefined) => {
                this.appTerm = activeTerm;
                this.setFormData();
            });
    }

    /**
     * Calls the api to update the MappingApplication record.
     */
    public updateAppTerm(): void {
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
     */
    private subscribeToFormChanges(): void {
        this.dataForm.controls['termTypeId'].valueChanges
        .subscribe(() => {
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
            // rowSelection: 'multiple',
            columnDefs: this.buildColumnDefs(),
            onGridReady: (params) => {
                this.gridInitialized = true;
                this.gridApi = params.api;

                if (params.api && this.gridDataNeedsSet) {
                    this.setGridData(this.gridApi); // Passing api to setGridData
                }
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
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
    private setGridData(api: GridApi) {
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
            // api.setRowData(gridData); // Alok: this is deprecated
            api.updateGridOptions({rowData: gridData});
            this.gridDataNeedsSet = false;
        }
    }

}

