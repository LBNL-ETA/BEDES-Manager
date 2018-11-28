import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesTermService } from '../../services/bedes-term/bedes-term.service';

@Component({
    selector: 'app-bedes-term-details',
    templateUrl: './bedes-term-details.component.html',
    styleUrls: ['./bedes-term-details.component.scss']
})
export class BedesTermDetailsComponent implements OnInit {
    public bedesTerm: BedesTerm | BedesConstrainedList | undefined;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private termService: BedesTermService
    ) {
    }

    ngOnInit() {
        this.termService.selectedTermSubject
        .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
            console.log(`${this.constructor.name}: selectedTerm`, selectedTerm);
            this.bedesTerm = selectedTerm;
        });
        const routeParams = this.route.snapshot.params;
        this.loadBedesTerm(Number(routeParams.id));
    }

    private loadBedesTerm(id: number): void {
        console.log(`load bedes term ${id}`, this.bedesTerm);
    }

}
