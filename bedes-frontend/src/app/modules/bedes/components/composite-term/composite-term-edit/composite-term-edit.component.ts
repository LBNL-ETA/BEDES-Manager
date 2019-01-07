import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-composite-term-edit',
    templateUrl: './composite-term-edit.component.html',
    styleUrls: ['./composite-term-edit.component.scss']
})
export class CompositeTermEditComponent implements OnInit {

    constructor(
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe((params: ParamMap) => {
            console.log(`${this.constructor.name}: route param = `, params.get('id'));
        })
        // this.route.paramMap.pipe(
        //     switchMap(params => {
        //       // (+) before `params.get()` turns the string into a number
        //     //   params.get('id');
        //         console.log(`${this.constructor.name}: route param`, params.get('id'))
        //         return params
        //     })
        //   );
    }

}
