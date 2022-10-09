import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { PasswordUpdate } from '@bedes-common/interfaces/password-update/password-update';
import { IPasswordResetResponse } from '@bedes-common/models/password-reset/password-reset';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    // The current ePB user
    public currentUser: CurrentUser | undefined;
    public hasError = false;
    // Error message displayed to the user in the ui when set.
    public errorMessage: string | undefined;
    // Indicates if the update was successfull
    public updateSuccess = false;
    // Data form
    public dataForm = this.formBuilder.group({
        emailAddress: ['', [Validators.required, Validators.email]]
    });
    /** indicates if a waiting for a response from the server  */
    public waitingForResponse = false;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private authService: AuthService,
    ) {

    }

    ngOnInit() {
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Make a request to reset an account password.
     */
    public resetPassword(): void {
        // reset any errors
        this.clearError();
        // get the account email
        const accountEmail = this.dataForm.controls.emailAddress.value;
        if (!accountEmail) {
            this.setError('Email address not entered');
        }
        this.waitingForResponse = true;
        // call the service
        this.authService.sendResetPasswordRequest(accountEmail)
        .subscribe((results: IPasswordResetResponse) => {
            this.updateSuccess = true;
            this.waitingForResponse = false;
        },
        (error: HttpErrorResponse) => {
            this.setError('An error occurred updating the password.');
            if (error.status === 400 && error.error) {
                this.setError(String(error.error))
            }
            else {
                this.setError('An error occured creating updating the password')
            }
            this.waitingForResponse = false;
        });
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
