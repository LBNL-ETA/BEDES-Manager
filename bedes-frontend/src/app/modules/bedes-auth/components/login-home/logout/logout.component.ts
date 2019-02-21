import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { Router } from '@angular/router';
import { getNextAuthUrl } from '../lib/get-next-url';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
    public currentUser: CurrentUser | undefined;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.subscribeToCurrentUser();
    }

    /* Initialization functions */
    private subscribeToCurrentUser(): void {
        this.authService.currentUserSubject
        .subscribe((currentUser: CurrentUser) => {
            console.log(`${this.constructor.name}: received user currentUser`);
            this.currentUser = currentUser;
            const nextUrl = getNextAuthUrl(currentUser.status);
            this.router.navigateByUrl(nextUrl);
        });
    }

    public logout(): void {
        this.authService.logout()
            .subscribe((results: any) => {
                // this.router.navigate(['/home/login']);
            });
    }

}
