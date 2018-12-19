import { Component, OnInit } from '@angular/core';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesTermService } from '../../services/bedes-term/bedes-term.service';
import { BedesDataType } from '@bedes-common/enums/bedes-data-type';
import { OptionViewState } from './option-view-state.enum';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-bedes-term-details',
    templateUrl: './bedes-term-details.component.html',
    styleUrls: ['./bedes-term-details.component.scss']
})
export class BedesTermDetailsComponent implements OnInit {
    public term: BedesTerm | BedesConstrainedList | undefined;
    public BedesDataType = BedesDataType
    public currentViewState = OptionViewState.ListOptionsView;
    public OptionViewState = OptionViewState;
    public currentViewStateSubject: BehaviorSubject<OptionViewState>;

    constructor(
        private termService: BedesTermService
    ) {
        // create the BehaviorSubject which emits the current view state
        // this will be used by child views to notify the parent of state changes
        this.currentViewStateSubject = new BehaviorSubject<OptionViewState>(this.currentViewState);
    }

    ngOnInit() {
        // subscribe to the state change BehaviorSubject
        this.currentViewStateSubject.subscribe(
            (newViewState: OptionViewState) => {
                console.log(`${this.constructor.name}: received state change..`, newViewState);
                this.currentViewState = newViewState;
            }
        )
        // subscribe to the selected term subject
        this.termService.selectedTermSubject
            .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
                console.log(`${this.constructor.name}: selectedTerm`, selectedTerm);
                this.term = selectedTerm;
            });
    }

}
