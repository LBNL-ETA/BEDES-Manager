import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ApplicationService } from '../../../services/application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application/mapping-application';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';
import { ApplicationScope } from '../../../../../../../../bedes-common/enums/application-scope.enum';


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
    selector: 'app-application-new',
    templateUrl: './application-new.component.html',
    styleUrls: ['./application-new.component.scss']
})
export class ApplicationNewComponent implements OnInit {
    // contains the status of the current request status
    public currentRequestStatus = RequestStatus.Idle;
    public RequestStatus = RequestStatus;
    // controls the current state of of the form controls
    public currentControlState = ControlState.Normal;
    public ControlState = ControlState;
    // Error messages
    public hasError: boolean;
    public errorMessage: string;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: ['']
    });

    constructor(
        private formBuilder: FormBuilder,
        private appService: ApplicationService
    ) { }

    ngOnInit() {
    }

    /**
     * Calls the api to create a new application.
     */
    public createNewApplication(): void {
        const newApp: IMappingApplication = this.getAppFromForm();
        console.log(`${this.constructor.name}: create new mapping application`, newApp);
        this.resetError();
        this.appService.newApplication(newApp)
        .subscribe(
            (newApp: MappingApplication) => {
                // application successfully created
                console.log(`${this.constructor.name}: create new App success`, newApp);
                this.currentControlState = ControlState.FormSuccess;
                this.currentRequestStatus = RequestStatus.Success;
                this.dataForm.disable();
            },
            (error: any) => {
                console.log(`${this.constructor.name}: Error creating new application`, error);
                this.setErrorMessage(error);
            }
        );
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

}
