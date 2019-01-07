import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ApplicationService } from '../../../services/application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application/mapping-application';
import { IMappingApplication } from '@bedes-common/models/mapping-application';
import { HttpStatusCodes } from '@bedes-common/enums/http-status-codes';


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
export class ApplicationEditComponent implements OnInit {
    // The active MappingApplication object.
    public app: MappingApplication;
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
        this.subscrbeToApplicationData();
    }

    /**
     * Subscribe to the active MappingApplication object.
     */
    private subscrbeToApplicationData(): void {
        this.appService.selectedItemSubject
        .subscribe((app: MappingApplication) => {
            this.app = app;
            this.setFormData();
        });
    }

    /**
     * Calls the api to update the MappingApplication record.
     */
    public updateApplication(): void {
        const newApp: IMappingApplication = this.getAppFromForm();
        newApp._id = this.app.id;
        console.log(`${this.constructor.name}: update mapping application`, newApp);
        this.resetError();
        this.appService.updateApplication(newApp)
        .subscribe(
            (newApp: MappingApplication) => {
                // application successfully created
                console.log(`${this.constructor.name}: create new App success`, newApp);
                // update the MappingApplication object with the new properties
                this.app.name = newApp.name;
                this.app.description = newApp.description;
                this.currentControlState = ControlState.FormSuccess;
                this.currentRequestStatus = RequestStatus.Success;
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
            this.app.name
        );
        // Description
        this.dataForm.controls['description'].setValue(
            this.app.description
        );

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
            _description: this.dataForm.value.description
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
