import { Component, OnInit, Input } from '@angular/core';
import { BedesTerm } from '@bedes-common/models/bedes-term/bedes-term';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';

@Component({
    selector: 'app-selected-term',
    templateUrl: './selected-term.component.html',
    styleUrls: ['./selected-term.component.scss']
})
export class SelectedTermComponent implements OnInit {
    @Input()
    private term: BedesTerm | BedesConstrainedList;

    constructor() { }

    ngOnInit() {
    }

}
