import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BedesTermSelectorService } from '../../../services/bedes-term-selector/bedes-term-selector.service';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
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

    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;

    constructor(
        private supportListService: SupportListService,
        private termSelectorService: BedesTermSelectorService,
        private dialog: MatDialog,
        private compositeTermService: CompositeTermService
    ) { }

    ngOnInit() {
        this.initializeSupportLists();
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
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            console.log(`${this.constructor.name}: received new composite term`, compositeTerm);
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
        console.log('compositeTerm', this.compositeTerm);
    }

    /**
     * Setup the lists that translates id's into text labels.
     */
    private initializeSupportLists(): void {
        this.supportListService.unitListSubject.subscribe(
            (results: Array<BedesUnit>) => {
                this.unitList = results;
            }
        );
        this.supportListService.dataTypeSubject.subscribe(
            (results: Array<BedesDataType>) => {
                this.dataTypeList = results;
            }
        );
        this.supportListService.termCategorySubject.subscribe(
            (results: Array<BedesTermCategory>) => {
                this.categoryList = results;
            }
        );
    }

    /**
     * Subscribe to the select terms subject.
     */
    private initTermSelectorSubscriber(): void {
        this.termSelectorService.selectedTermsSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
                console.log(`${this.constructor.name}: received search results...`, results);
                this.selectedTerms = results;
                this.addNewItemsToCompositeTerm(results);
            },
            (error: any) => {
                console.error(`${this.constructor.name}: error in ngOnInit`)
                console.error(error);
                throw error;
            });
    }

    /**
     * Save the composite term to the database.
     */
    public saveCompositeTerm(): void {
        console.log('save the composite term');
        if (this.compositeTerm.id) {
            // an existing term
            this.compositeTermService.updateTerm(this.compositeTerm)
            .subscribe((results: BedesCompositeTerm) => {
                console.log(`${this.constructor.name}: save compoisite term success`, results);
                this.compositeTerm = results;
            });
        }
        else {
            // new term, save it to the database.
            this.compositeTermService.saveNewTerm(this.compositeTerm)
            .subscribe((results: BedesCompositeTerm) => {
                console.log(`${this.constructor.name}: save compoisite term success`, results);
                this.compositeTerm = results;
            });
        }
    }


    /**
     * Remove the terms selected by the user.
     */
    public removeSelectedTerms(): void {
        console.log('remove selected terms');
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '650px',
            position: {top: '20px'},
            data: {
                dialogTitle: 'Confirm?',
                dialogContent: 'Remove the selected terms?',
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log('dialogRef.afterClosed()', result);
        });
    }

    public drop(event: CdkDragDrop<string[]>) {
        console.log('before', this.compositeTerm.items);
        moveItemInArray(this.compositeTerm.items, event.previousIndex, event.currentIndex);
        console.log('new array?', this.compositeTerm.items);
        let newIndex = 1;
        this.compositeTerm.items.forEach((item) => {
            item.orderNumber = newIndex++;
        });
        // refresh the compositeTerm to reflect the new term ordering.
        this.compositeTerm.refresh();
    }
}
