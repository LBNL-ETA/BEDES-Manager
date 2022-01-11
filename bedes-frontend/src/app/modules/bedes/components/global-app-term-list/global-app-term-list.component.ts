import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-global-app-term-list',
    templateUrl: './global-app-term-list.component.html',
    styleUrls: ['./global-app-term-list.component.scss']
})
export class GlobalAppTermListComponent implements OnInit {

    constructor() {
    }

    ngOnInit(): void {
    }

    quickFilterChange($event: KeyboardEvent) {

    }
}
