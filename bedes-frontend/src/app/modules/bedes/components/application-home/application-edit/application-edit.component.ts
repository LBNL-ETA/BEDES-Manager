import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, Validators, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { ApplicationService } from '../../../services/application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application/mapping-application';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { AppTermService } from '../../../services/app-term/app-term.service';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';
import { Scope } from '@bedes-common/enums/scope.enum';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { CurrentUser } from '@bedes-common/models/current-user';
import { applicationScopeList } from '@bedes-common/lookup-tables/application-scope-list';
import { authLoggedInFactory } from '../../../../bedes-auth/services/auth/auth-factory.service';
import { ApplicationScope } from '../../../../../../../../bedes-common/enums/application-scope.enum';
import { CompositeTermService } from '../../../services/composite-term/composite-term.service';

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

@Component({
  selector: 'app-application-edit',
  templateUrl: './application-edit.component.html',
  styleUrls: ['./application-edit.component.scss']
})
export class ApplicationEditComponent implements OnInit, OnDestroy {
    // The active MappingApplication object.
    public app: MappingApplication;
    // The active MappingApplication's AppTerms
    public termList: Array<AppTerm | AppTermList>;
    public scopeList = applicationScopeList.items;
    // contains the status of the current request status
    public currentRequestStatus = RequestStatus.Idle;
    public RequestStatus = RequestStatus;
    // controls the current state of of the form controls
    public currentControlState = ControlState.Normal;
    public ControlState = ControlState;
    // Error messages
    public hasError: boolean;
    public errorMessage: string;
    /** indicates if the component is editable */
    public isEditable = false;
    /** The current user */
    public currentUser: CurrentUser;
    /** the current authenticated user */
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    /** Reference to the component's form */
    @ViewChild('theForm')
    private theForm: NgForm;

    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: [''],
        scopeId: ['']
    });

    constructor(
        private authService: AuthService,
        private formBuilder: FormBuilder,
        private appService: ApplicationService,
        private appTermService: AppTermService,
        private compositeTermService: CompositeTermService
    ) { }

    ngOnInit() {
        this.subscribeToUserStatus();
        this.subscrbeToMappingApplication();
        this.subscribeToAppTerms();
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
            console.log('current application', app);
            this.app = app;
            this.setFormData();
            this.setScopeControlStatus();
            this.setDataControlStatus();
        });
    }

    /**
     * Subscribe to the user status Observable to get keep the user status up to date.
     */
    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                console.log(`${this.constructor.name}: received user status`, currentUser);
                this.currentUser = currentUser;
                this.isEditable = currentUser.isLoggedIn();
                this.setFormData();
                this.setScopeControlStatus();
                this.setDataControlStatus();
            });
    }

    /**
     * Subscribe to the BehaviorSubject that serves the
     * active Mapping Application's set of AppTerms.
     */
    private subscribeToAppTerms(): void {
        console.log('subscribe to app terms')
        this.appTermService.termListSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((termList: Array<AppTerm | AppTermList>) => {
            console.log(`${this.constructor.name}: received app terms`, termList);
            this.termList = termList;
        });
    }

    /**
     * Determines if the data in the view is editable.
     * @returns true if the application is editable.
     */
    public canEditApplication(): boolean {
        return this.currentUser && this.app && this.currentUser.canEditApplication(this.app)
            ? true
            : false;
    }

    /**
     * Indicates if the ApplicationScope input is allowed to be changed.
     * @returns true if change application scope
     */
    public canChangeApplicationScope(): boolean {
        return this.canEditApplication();
    }

    /**
     * Indicates if the mapping application data has changed.
     * @returns true if has changed
     */
    public dataHasChanged(): boolean {
        return this.theForm && this.theForm.dirty
            ? true
            : false;
    }

    /**
     * Calls the api to update the MappingApplication record.
     */
    public updateApplication(): void {
        const newApp: IMappingApplication = this.getAppFromForm();
        newApp._id = this.app.id;
        this.resetError();
        const scopeChange = (this.app && this.app.scopeId === ApplicationScope.Private && newApp._scopeId === ApplicationScope.Public)
            ? true : false;
        this.appService.updateApplication(newApp)
        .subscribe(
            (newApp: MappingApplication) => {
                // application successfully created
                // update the MappingApplication object with the new properties
                this.appService.load();
                this.app.name = newApp.name;
                this.app.description = newApp.description;
                this.app.clearChangeFlag();
                this.currentControlState = ControlState.FormSuccess;
                this.currentRequestStatus = RequestStatus.Success;
                this.theForm.form.markAsPristine();
                if (scopeChange) {
                    this.compositeTermService.load();
                }
            },
            (error: any) => {
                console.log(`${this.constructor.name}: Error creating new application`, error);
                this.setErrorMessage(error);
            }
        );
    }

    /**
     * Set the form data from the active MappingApplication.
     */
    private setFormData(): void {
        // Application name
        this.dataForm.controls['name'].setValue(
            this.app ? this.app.name : ''
        );
        // Description
        this.dataForm.controls['description'].setValue(
            this.app ? this.app.description : ''
        );
        // ScopeId
        this.dataForm.controls['scopeId'].setValue(
            this.app ? this.app.scopeId : ''
        );

    }

    /**
     * Determines which inputs are enabled/disabled based on the current authenticated user
     */
    private setScopeControlStatus(): void {
        if (this.canChangeApplicationScope()) {
            this.enableScopeControls();
        }
        else {
            this.disableScopeControls();
        }
    }

    private setDataControlStatus(): void {
        if (this.canEditApplication()) {
            this.enableDataControls();
        }
        else {
            this.disableDataControls();
        }
    }

    private enableScopeControls(): void {
        this.dataForm.controls.scopeId.enable();
    }

    private disableScopeControls(): void {
        this.dataForm.controls.scopeId.disable();
    }

    private enableDataControls(): void {
        this.dataForm.controls.name.enable();
        this.dataForm.controls.description.enable();
    }

    private disableDataControls(): void {
        this.dataForm.controls.name.disable();
        this.dataForm.controls.description.disable();
    }

    /**
     * Updates the active MappingApplication object with the
     * values from the dataForm.
     */
    private updateApplicationFromForm(): void {
        const values = this.getAppFromForm();
        this.app.name = values._name;
        this.app.description = values._description;
    }

    /**
     * Return an IApp object using the current values from the dataForm.
     */
    private getAppFromForm(): IMappingApplication {
        const newApp: IMappingApplication = {
            _name: this.dataForm.value.name,
            _description: this.dataForm.value.description,
            _scopeId: this.dataForm.value.scopeId
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

}
