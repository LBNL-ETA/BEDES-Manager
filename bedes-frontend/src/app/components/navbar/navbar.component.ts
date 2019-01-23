import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth/services/auth/auth.service';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { CurrentUser } from '@bedes-common/models/current-user';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    public currentUser: CurrentUser | undefined;
    public UserStatus = UserStatus;

    constructor(
        private authService: AuthService
    ) { }

    ngOnInit() {
        // get updates on the authentication status of the user.
        this.authService.currentUserSubject
        .subscribe((currentUser: CurrentUser) => {
            console.log(`${this.constructor.name}: received new user, isLoggedIn = ${currentUser.isLoggedIn()}`, currentUser);
            this.currentUser = currentUser;
        });
    }

    public logout(): void {
        console.log('logout');
        this.authService.logout()
        .subscribe((results: any) => {
            console.log(`${this.constructor.name}: received results`, results);
        }, (error: any) => {
            console.error('error logging out', error);
        });
    }

}
