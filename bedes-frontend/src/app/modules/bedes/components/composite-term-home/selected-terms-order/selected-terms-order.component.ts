import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BedesTermSelectorService } from '../../../services/bedes-term-selector/bedes-term-selector.service';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { CompositeTermService } from '../../../services/composite-term/composite-term.service';

@Component({
  selector: 'app-selected-terms-order',
  templateUrl: './selected-terms-order.component.html',
  styleUrls: ['./selected-terms-order.component.scss']
})
export class SelectedTermsOrderComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public compositeTerm: BedesCompositeTerm;
    public selectedTerms: Array<BedesTerm | BedesConstrainedList>;

    constructor(
        private termSelectorService: BedesTermSelectorService,
        private compositeTermService: CompositeTermService
    ) { }

    ngOnInit() {
        this.initTermSelectorSubscriber();
        this.subscribeToActiveTerm();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the active composite term observable.
     */
    private subscribeToActiveTerm(): void {
        this.compositeTermService.selectedTermSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            this.compositeTerm = compositeTerm;
        })
    }

    /**
     * Add BedesTerms to the current CompositeTerm.
     */
    private addNewItemsToCompositeTerm(newTerms: Array<BedesTerm | BedesConstrainedList>): void {
        newTerms.forEach((newTerm) => {
            if (!this.compositeTerm.termExistsInDefinition(newTerm.toInterface())) {
                this.compositeTerm.addBedesTerm(newTerm);
            }
        });
    }

    /**
     * Subscribe to the select terms subject.
     */
    private initTermSelectorSubscriber(): void {
        this.termSelectorService.selectedTermsSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
                this.selectedTerms = results;
                this.addNewItemsToCompositeTerm(results);
            },
            (error: any) => {
                console.error(`${this.constructor.name}: error in ngOnInit`)
                console.error(error);
                throw error;
            });
    }

    public drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.compositeTerm.items, event.previousIndex, event.currentIndex);
        let newIndex = 1;
        this.compositeTerm.items.forEach((item) => {
            item.orderNumber = newIndex++;
        });
        // refresh the compositeTerm to reflect the new term ordering.
        this.compositeTerm.refresh();
    }
}
