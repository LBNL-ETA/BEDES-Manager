import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { getNextAuthUrl } from '../lib/get-next-url';
import { PasswordUpdate } from '@bedes-common/interfaces/password-update/password-update';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    // The current ePB user
    public currentUser: CurrentUser | undefined;
    // Error message displayed to the user in the ui when set.
    public errorMessage: string | undefined;
    // Indicates if the update was successfull
    public updateSuccess = false;
    // Data form
    public dataForm = this.formBuilder.group({
        password: ['', Validators.required],
        passwordConfirm: ['', Validators.required],
    });

    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
    ) {

    }

    ngOnInit() {
        this.subscribeToCurrentUser();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
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
     * Retrieve's the current password values
     */
    private getPasswordUpdateData(): PasswordUpdate {
        return new PasswordUpdate(
            this.dataForm.controls.password.value,
            this.dataForm.controls.passwordConfirm.value
        );
    }

    public updatePassword(): void {
        this.clearError();
        const passwordUpdate = this.getPasswordUpdateData();
        if (!passwordUpdate) {
            throw new Error(`${this.constructor.name}: error retrieving password details.`);
        }
        else if (!passwordUpdate.isValid()) {
            throw new Error(`${this.constructor.name}: paswords invalid`)
        }
        this.authService.updatePassword(passwordUpdate)
        .subscribe((results: any) => {
            this.updateSuccess;
        },
        (error: Error) => {
            console.log('Error updating the password...', error);
            this.setError('An error occurred updating the password.');
        });
    }

    private setError(errorMessage: string): void {
        this.errorMessage = errorMessage;
    }

    private clearError(): void {
        this.errorMessage = "";
    }


}
