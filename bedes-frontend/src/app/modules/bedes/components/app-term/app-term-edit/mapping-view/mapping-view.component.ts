import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { AppTerm } from '../../../../../../../../../bedes-common/models/app-term/app-term';
import { AppTermService } from '../../../../services/app-term/app-term.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-mapping-view',
    templateUrl: './mapping-view.component.html',
    styleUrls: ['./mapping-view.component.scss']
})
export class MappingViewComponent implements OnInit {
    public isSearchDisplayed = false;
    public appTerm: AppTerm;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private appTermService: AppTermService
    ) {
    }

    ngOnInit() {
        this.subscribeToActiveTerm();
    }

    /**
     * Subscribe to the BehaviorSubject that serves the
     * active Mapping Application's set of AppTerms.
     */
    private subscribeToActiveTerm(): void {
        console.log('subscribe to the active AppTerm')
        this.appTermService.activeTermSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((activeTerm: AppTerm | undefined) => {
                this.appTerm = activeTerm;
            });
    }

    public showTermSearch(): void {
        this.isSearchDisplayed = true;
    }

    public backFromSearch(): void {
        this.isSearchDisplayed = false;
    }

}
