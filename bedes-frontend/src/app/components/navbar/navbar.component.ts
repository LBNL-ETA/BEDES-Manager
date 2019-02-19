import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth/services/auth/auth.service';
import { UserStatus } from '@bedes-common/enums/user-status.enum';
import { CurrentUser } from '@bedes-common/models/current-user';
import { Router } from '@angular/router';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    public currentUser: CurrentUser | undefined;
    public UserStatus = UserStatus;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        // get updates on the authentication status of the user.
        this.authService.currentUserSubject
        .subscribe((currentUser: CurrentUser) => {
            console.log(`${this.constructor.name}: received new user, isLoggedIn = ${currentUser.isLoggedIn()}`, currentUser);
            this.currentUser = currentUser;
        });
    }

    /**
     * Navigate to the home route.
     */
    public home(): void {
        this.router.navigate(['home']);
    }

    /**
     * Logs the current user out of the system.
     */
    public logout(): void {
        this.authService.logout()
        .subscribe((results: any) => {
        }, (error: any) => {
        });
    }

}
