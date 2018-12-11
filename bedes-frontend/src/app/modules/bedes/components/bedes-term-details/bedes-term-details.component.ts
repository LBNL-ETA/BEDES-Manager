import { Component, OnInit } from '@angular/core';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesTermService } from '../../services/bedes-term/bedes-term.service';
import { BedesDataType } from '@bedes-common/enums/bedes-data-type';

@Component({
    selector: 'app-bedes-term-details',
    templateUrl: './bedes-term-details.component.html',
    styleUrls: ['./bedes-term-details.component.scss']
})
export class BedesTermDetailsComponent implements OnInit {
    public term: BedesTerm | BedesConstrainedList | undefined;
    public BedesDataType = BedesDataType

    constructor(
        private termService: BedesTermService
    ) {
    }

    ngOnInit() {
        this.termService.selectedTermSubject
            .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
                console.log(`${this.constructor.name}: selectedTerm`, selectedTerm);
                this.term = selectedTerm;
            });
    }

}
