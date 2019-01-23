import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog} from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { AuthService } from '../../../services/auth/auth.service';
import { UserLogin } from '../../../models/auth/user-login';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
// import { UserInfoComponent } from '../../../epb-account/components/user-info/user-info.component';
import { CurrentUser } from '../../../../../../../../bedes-common/models/current-user/current-user';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public waiting = false;
    public userLogin: UserLogin;
    public loginSuccess = false;
    public loginError = false;
    public loginErrorMessage: string;
    public isEditable = false;
    public currentUser: CurrentUser;
    public UserStatus = UserStatus;

    constructor(
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog
    ) { }

    /**
     * Initialize the component.
     *
     * @memberof LoginComponent
     */
    ngOnInit() {
        // create a new UserLogin object
        this.userLogin = new UserLogin();
        this.subscribeToUserStatus();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                this.currentUser = currentUser;
            });
    }

    public isLoggedIn(): boolean {
        return this.currentUser ? this.currentUser.isLoggedIn() : false;
    }
}
