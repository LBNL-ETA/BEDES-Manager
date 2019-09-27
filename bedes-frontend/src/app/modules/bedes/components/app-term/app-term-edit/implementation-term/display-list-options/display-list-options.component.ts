import { Component, OnInit, Input } from '@angular/core';
import { OptionViewState } from '../../../../../models/list-options/option-view-state.enum';
import { BehaviorSubject } from 'rxjs';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';

@Component({
    selector: 'app-display-list-options',
    templateUrl: './display-list-options.component.html',
    styleUrls: ['./display-list-options.component.scss']
})
export class DisplayListOptionsComponent implements OnInit {
    /* BehaviorSubject to notify the container that a request
     * was made for a change of state, most likely to go back
     * to the app term option list.
    */
    @Input()
    private stateChangeSubject: BehaviorSubject<OptionViewState>;
    /*
     *input variable for the application term under edit
     */
    @Input()
    private appTerm: AppTermList;

    constructor() { }

    ngOnInit() {
    }

}
