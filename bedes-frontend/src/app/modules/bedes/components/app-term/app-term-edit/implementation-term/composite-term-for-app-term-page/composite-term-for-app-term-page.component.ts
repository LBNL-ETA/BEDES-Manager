import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AppTerm, AppTermList} from '@bedes-common/models/app-term';

@Component({
    selector: 'app-composite-term-for-app-term-page',
    templateUrl: './composite-term-for-app-term-page.component.html',
    styleUrls: ['./composite-term-for-app-term-page.component.scss']
})
export class CompositeTermForAppTermPageComponent implements OnInit {

    public appTerm: AppTerm | AppTermList | undefined;

    constructor(
        private route: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        this.setRouteData();
    }

    private setRouteData(): void {
        this.route.data
            .subscribe((data: any) => {
                this.appTerm = data.appTerm;
            });
    }
}
