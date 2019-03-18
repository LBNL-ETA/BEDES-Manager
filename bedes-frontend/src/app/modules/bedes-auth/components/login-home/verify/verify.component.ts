import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { getNextAuthUrl } from '../lib/get-next-url';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-verify',
    templateUrl: './verify.component.html',
    styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private verificationCode: string | undefined;
    // The current ePB user
    public currentUser: CurrentUser | undefined;
    // Error message displayed to the user in the ui when set.
    public verifyErrorMessage: string | undefined;
    // Indicates if the code verification was successfull
    public verifySuccess = false;
    // Data form
    public dataForm = this.formBuilder.group({
        verificationCode: ['', Validators.required],
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
    ) {

    }

    ngOnInit() {
        this.assignVerificationCode();
        this.setFormValues();
        this.subscribeToCurrentUser();
    }

    /**
     * Assign the verification code if it's present in the url.
     */
    private assignVerificationCode(): void {
        this.verificationCode = this.route.snapshot.paramMap.get('verificationCode');
    }

    /**
     * Assigns initial values to the form controls.
     */
    private setFormValues(): void {
        this.dataForm.controls['verificationCode'].setValue(
            this.verificationCode
        );
    }

    /**
     * Subscribe to the currentUser BehaviorSubject to keep
     * the currentUser up-to-date.
     */
    private subscribeToCurrentUser(): void {
        this.authService.currentUserSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((currentUser: CurrentUser) => {
            this.currentUser = currentUser;
            const nextUrl = getNextAuthUrl(currentUser.status);
            this.router.navigateByUrl(nextUrl);
        });
    }

    /**
     * Retrieve's the current value of the verification code in
     * the UI.
     */
    private getVerificationCodeFromForm(): string {
        return this.dataForm.controls['verificationCode'].value
    }

    public newVerificationCode(): void {
        this.authService.newVerificationCode()
        .subscribe((results: any) => {
        });
    }

    /**
     * Verify the code.
     *
     * Calls the backend api to verify the code.
     */
    public verify(): void {
        const verificationCode = this.getVerificationCodeFromForm();
        if (!verificationCode) {
            throw new Error(`${this.constructor.name}: verify expects verificationCode to be set.`);
        }
        this.authService.verify(verificationCode)
        .subscribe((results: any) => {
        },
        (error: Error) => {
            console.log('Error verifying the code...', error);
        });
    }

    /**
     * Logout the user, redirect to login.
     */
    public logout(): void {
        this.authService.logout()
        .subscribe((results: any) => {
            console.log('logout = ', results);
        })

    }

}
