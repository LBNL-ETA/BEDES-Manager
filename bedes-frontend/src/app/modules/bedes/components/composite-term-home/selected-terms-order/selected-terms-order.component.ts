import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BedesTermSelectorService } from '../../../services/bedes-term-selector/bedes-term-selector.service';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { CompositeTermService } from '../../../services/composite-term/composite-term.service';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user';
import { CompositeTermDetail } from '../../../../../../../../bedes-common/models/bedes-composite-term/composite-term-item/composite-term-detail';

@Component({
  selector: 'app-selected-terms-order',
  templateUrl: './selected-terms-order.component.html',
  styleUrls: ['./selected-terms-order.component.scss']
})
export class SelectedTermsOrderComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public compositeTerm: BedesCompositeTerm;
    public selectedTerms: Array<BedesTerm | BedesConstrainedList>;
    public currentUser: CurrentUser;
    public isEditable = false;

    constructor(
        private termSelectorService: BedesTermSelectorService,
        private authService: AuthService,
        private compositeTermService: CompositeTermService
    ) { }

    ngOnInit() {
        this.initTermSelectorSubscriber();
        this.subscribeToUserStatus();
        this.subscribeToActiveTerm();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Remove a term from a composite term defitition
     */
    public removeDetailItem(item: CompositeTermDetail): void {
        this.compositeTerm.removeDetailItem(item);
    }

    /**
     * Subscribe to the active composite term observable.
     */
    private subscribeToActiveTerm(): void {
        this.compositeTermService.selectedTermSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            this.compositeTerm = compositeTerm;
            this.updateEditStatus();
        })
    }

    /**
     * Subscribe to the user status Observable to get keep the user status up to date.
     */
    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                // assign the authenticated user
                this.currentUser = currentUser;
                this.updateEditStatus();
            });
    }

    /**
     * Update the edit status of the control, ie sets
     * whether the terms can be redordered or just displayed.
     */
    private updateEditStatus(): void {
        if(this.compositeTerm
            && this.currentUser.isLoggedIn()
            && !this.compositeTerm.hasApprovedScope()
            && (
                this.compositeTerm.isNewTerm()
                || this.currentUser.canEditCompositeTerm(this.compositeTerm)
                || this.currentUser.isAdmin()
        )) {
            this.isEditable = true;
        }
        else {
            this.isEditable = false;
        }
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
