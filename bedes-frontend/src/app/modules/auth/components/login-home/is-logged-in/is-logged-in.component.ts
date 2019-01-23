import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { UserLogin } from '../../../models/auth/user-login';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';

@Component({
    selector: 'app-is-logged-in',
    templateUrl: './is-logged-in.component.html',
    styleUrls: ['./is-logged-in.component.scss']
})
export class IsLoggedInComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public currentUser: CurrentUser;

    constructor(
        private authService: AuthService,
    ) { }

    ngOnInit() {
        // get updates on the authentication status of the user.
        this.authService.currentUserSubject
        .subscribe((currentUser: CurrentUser) => {
            console.log(`${this.constructor.name}: received new user, isLoggedIn = ${currentUser.isLoggedIn()}`, currentUser);
            this.currentUser = currentUser;
        });
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public logout(): void {
        this.authService.logout()
        .subscribe((results: any) => {
            console.log(`${this.constructor.name}: logout success`, results);
        });
    }


}
