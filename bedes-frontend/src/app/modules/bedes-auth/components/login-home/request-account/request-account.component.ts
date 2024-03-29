import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NewAccount } from '../../../models/auth/new-account';
import { AuthService } from '../../../services/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-request-account',
    templateUrl: './request-account.component.html',
    styleUrls: ['./request-account.component.scss']
})
export class RequestAccountComponent implements OnInit {
    //
    public requestSuccess = false;
    // error indicators
    public hasError = false;
    public errorMessage = '';
    // Form object for the request
    public requestForm = this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        organization: ['', Validators.required],
        password: ['', Validators.required],
        passwordConfirm: ['', Validators.required]
    });
    /** indicates if a waiting for a response from the server  */
    public waitingForResponse = false;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private authService: AuthService
    ) {
    }

    ngOnInit() {
    }

    /**
     * Submit the request for creating a new account.
     */
    public submitForm(): void {
        const account = new NewAccount({
            firstName: this.requestForm.get('firstName').value,
            lastName: this.requestForm.get('lastName').value,
            email: this.requestForm.get('email').value,
            organization: this.requestForm.get('organization').value,
            password: this.requestForm.get('password').value,
            passwordConfirm: this.requestForm.get('passwordConfirm').value
        });
        this.resetErrorIndicators();

        this.waitingForResponse = true;
        this.authService.requestAccount(account).subscribe(
            (results: any) => {
                this.requestSuccess = true;
                this.requestForm.disable();
                this.waitingForResponse = false;
            },
            (error: HttpErrorResponse) => {
                this.hasError = true;
                if (error.status === 400 && error.error) {
                    this.errorMessage = String(error.error);
                }
                else {
                    this.errorMessage = 'An error occured creating the new account.'
                }
                this.waitingForResponse = false;
            }
        );
    }

    private resetErrorIndicators(): void {
        this.requestSuccess = false;
        this.hasError = false;
        this.errorMessage = '';
    }

}
