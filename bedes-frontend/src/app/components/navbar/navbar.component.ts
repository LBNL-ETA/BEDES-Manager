import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth/services/auth/auth.service';
import { UserStatus } from '@bedes-common/enums/user-status.enum';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    public currentStatus: UserStatus = UserStatus.NotLoggedIn;
    public UserStatus = UserStatus;

    constructor(
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.authService.userStatusSubject
        .subscribe((currentStatus: UserStatus) => {
            this.currentStatus = currentStatus;
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
