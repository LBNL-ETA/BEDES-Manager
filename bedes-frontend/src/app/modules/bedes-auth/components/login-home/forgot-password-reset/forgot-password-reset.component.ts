import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { PasswordUpdate } from '@bedes-common/interfaces/password-update/password-update';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-forgot-password-reset',
    templateUrl: './forgot-password-reset.component.html',
    styleUrls: ['./forgot-password-reset.component.scss']
})
export class ForgotPasswordResetComponent implements OnInit {
    public hasError = false;
    // Error message displayed to the user in the ui when set.
    public errorMessage: string | undefined;
    // Indicates if the update was successfull
    public updateSuccess = false;
    // uuid of the user making the request
    private _uuid: string;
    get uuid(): string {
        return this._uuid;
    }
    // request token
    private _token: string;
    get token(): string {
        return this._token
    }
    // data form
    public dataForm = this.formBuilder.group({
        password: ['', Validators.required],
        passwordConfirm: ['', Validators.required],
    });
    /** indicates if a waiting for a response from the server  */
    public waitingForResponse = false;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.assignRouteParams();
    }

    /**
     * Assign the parameters from the route url
     */
    private assignRouteParams(): void {
        this._uuid = this.route.snapshot.paramMap.get('uuid');
        this._token = this.route.snapshot.paramMap.get('token');
    }

    /**
     * Call the auth service to finish resetting the password
     */
    public updatePassword(): void {
        this.clearError();
        const passwordUpdate = this.getPasswordUpdateData();
        // check for valid parameteres
        if (!passwordUpdate) {
            this.setError('Error retrieving password information');
            return;
        }
        else if (!passwordUpdate.isValid()) {
            this.setError('Invalid passwords');
            return;
        }
        // call the api service
        this.waitingForResponse = true;
        this.authService.resetPassword(this._uuid, this._token, passwordUpdate)
        .subscribe((results: any) => {
            this.updateSuccess = true;
            this.waitingForResponse = false;
        },
        (error: Error) => {
            this.setError('An error occurred updating the password.');
            this.waitingForResponse = false;
        });
    }

    /**
     * Retrieve's the current password values
     */
    private getPasswordUpdateData(): PasswordUpdate {
        return new PasswordUpdate(
            this.dataForm.controls.password.value,
            this.dataForm.controls.passwordConfirm.value
        );
    }


    private setError(errorMessage: string): void {
        this.hasError = true;
        this.errorMessage = errorMessage;
    }

    private clearError(): void {
        this.hasError = false;
        this.errorMessage = "";
    }

}
