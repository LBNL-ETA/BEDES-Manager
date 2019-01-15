import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../services/application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';

@Component({
    selector: 'app-application-home',
    templateUrl: './application-home.component.html',
    styleUrls: ['./application-home.component.scss']
})
export class ApplicationHomeComponent implements OnInit {
    public activeApp: MappingApplication | undefined;

    constructor(
        private appService: ApplicationService
    ) { }

    ngOnInit() {
        // Subscribe to the selected application BehaviorSubject.
        this.appService.selectedItemSubject
            .subscribe((activeApp: MappingApplication) => {
                this.activeApp = activeApp;
            });
    }

}
