import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../services/application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { AuthService } from '../../../bedes-auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-application-home',
    templateUrl: './application-home.component.html',
    styleUrls: ['./application-home.component.scss']
})
export class ApplicationHomeComponent implements OnInit {
    public activeApp: MappingApplication | undefined;
    private currentUser: CurrentUser;

    constructor(
        private appService: ApplicationService,
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        // get the data from the resolver
        this.setRouteData();
        // subscribe to the dependent data sources
        this.subscribeToCurrentUser();
        this.subscribeToSelectedApplication();
    }

    private setRouteData(): void {
        this.route.data
        .subscribe((data: any) => {
            this.activeApp = data.application;
        });
    }

    private subscribeToSelectedApplication(): void {
        // Subscribe to the selected application BehaviorSubject.
        this.appService.selectedItemSubject
            .subscribe((activeApp: MappingApplication) => {
                this.activeApp = activeApp;
            });
    }

    private subscribeToCurrentUser(): void {
        this.authService.currentUserSubject
        .subscribe((currentUser: CurrentUser) => {
            this.currentUser = currentUser;
        })
    }

    /**
     * Determines if the view should show the application options.
     * @returns true if application options should be visible
     */
    public areApplicationOptionsVisible(): boolean {
        return this.currentUser.canEditApplication(this.activeApp);
    }

}
