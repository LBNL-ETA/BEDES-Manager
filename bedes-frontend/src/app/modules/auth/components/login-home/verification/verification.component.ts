import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

// import { AuthService } from 'app/services/auth/auth.service';
// import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, DialogPosition } from '@angular/material';
// import { WaitingDialogComponent } from 'app/components/dialogs/waiting-dialog/waiting-dialog.component';
// import { ExceptionDialogComponent } from 'app/components/dialogs/exception-dialog/exception-dialog.component';
// import { ExceptionDialogData } from 'app/components/dialogs/exception-dialog/exception-dialog-data';

// import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { MatDialog } from '@angular/material';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { WaitingDialogComponent } from 'src/app/components/waiting-dialog/waiting-dialog.component';
import { takeUntil } from 'rxjs/operators';

// import { Subject } from 'rxjs/Subject';
// import 'rxjs/add/operator/takeUntil';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';

@Component({
    selector: 'app-verification',
    templateUrl: './verification.component.html',
    styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit, OnDestroy {
    public verifySuccess = false;
    public verifyError = false;
    public newCodeSuccess = false;
    public verificationCode = '';
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        // get the verification code from the url if it's there
        this.verificationCode = this.route.snapshot.paramMap.get('verificationCode');
        console.log('verification code', this.verificationCode);
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                // // console.log('needs verification ?', this.authService.needsVerify());
                // if (!this.authService.needsVerify()) {
                //     // console.log('not logged in, redirecint to login...', this.router.url);
                //     this.authService.redirectUrl = ['verify'];
                //     if (this.verificationCode) {
                //         this.authService.redirectUrl.push({verification_code: this.verificationCode});
                //     }
                //     this.router.navigate(['/login']);
                // }
                // // else {
                // //     this.router.navigate(['/home']);
                // // }
            });
    }

    ngOnDestroy() {
        // unsubscribe from the various subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public verify(): void {
        const dialogRef = this.dialog.open(WaitingDialogComponent, {
            panelClass: 'dialog-waiting',
            disableClose: true
        });
        this.authService.verifyAccount(this.verificationCode).subscribe(
            (data) => {
                // console.log(`${ this.constructor.name }: verification success`, data);
                if (this.authService.isLoggedIn()) {
                    this.verifySuccess = true;
                    this.verifyError = false;
                }
                else {
                    this.verifySuccess = false;
                    this.verifyError = true;
                }
                dialogRef.close();
            },
            (error) => {
                // console.log('error', error);
                this.verifySuccess = false;
                this.verifyError = true;
                dialogRef.close();
            }
        );
    }

    /**
     * Request a new verification code.
     */
    public newVerificationCode(): void {
        this.authService.newVerificationCode()
        .subscribe((results: any) => {
            console.log(`${this.constructor.name}: received newVerificationCode results`, results);
            this.newCodeSuccess = true;
        }, (error: any) => {
            console.log('Error sending new verification code', error);
        })
    }

    public forgotPassword(): void {
        console.log('forgot password...');
    }
}
