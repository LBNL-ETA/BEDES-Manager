import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NewAccount } from '../../../models/auth/new-account';
import { AuthService } from '../../../services/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IUserStatus } from '@bedes-common/interfaces/user-status';

@Component({
    selector: 'app-request-account',
    templateUrl: './request-account.component.html',
    styleUrls: ['./request-account.component.scss']
})
export class RequestAccountComponent implements OnInit {
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

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService
    ) {
    }

    ngOnInit() {
    }

    public submitForm(): void {
        const account = new NewAccount({
            firstName: this.requestForm.get('firstName').value,
            lastName: this.requestForm.get('lastName').value,
            email: this.requestForm.get('email').value,
            organization: this.requestForm.get('organization').value,
            password: this.requestForm.get('password').value,
            passwordConfirm: this.requestForm.get('passwordConfirm').value
        });
        console.log('create account', account);

        this.authService.requestAccount(account).subscribe(
            (results: IUserStatus) => {
                console.log(`${this.constructor.name}: results`, results);
            },
            (error: HttpErrorResponse) => {
                console.log(`${this.constructor.name}: Error creating new account`);
                console.log(error);
                this.errorMessage = "I have an error";
                this.hasError = true;
                if (error.status === 400 && error.error) {
                    this.errorMessage = String(error.error);
                }
                else {
                    this.errorMessage = 'An error occured creating the new project.'
                }
            }
        );
    }

}