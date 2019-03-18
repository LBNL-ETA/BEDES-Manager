import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { BedesTermSearchDialogComponent } from '../../dialogs/bedes-term-search-dialog/bedes-term-search-dialog.component';
import { MatDialog } from '@angular/material';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { CompositeTermService } from '../../../services/composite-term/composite-term.service';
import { FormBuilder } from '@angular/forms';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit';
import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';
import { ISearchDialogOptions } from '../../dialogs/bedes-term-search-dialog/search-dialog-options.interface';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';
import { ICompositeTermDetailRequestParam } from '@bedes-common/models/composite-term-detail-request-param/composite-term-detail-request-param.interface';
import { CompositeTermDetailRequestResult } from '@bedes-common/models/composite-term-detail-request-result/composite-term-detail-request-result';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-term-builder-edit',
    templateUrl: './term-builder-edit.component.html',
    styleUrls: ['./term-builder-edit.component.scss']
})
export class TermBuilderEditComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public compositeTerm: BedesCompositeTerm;
    public unitList: Array<BedesUnit>;
    public isEditable: boolean;
    /* The current user */
    public currentUser: CurrentUser;
    public isWaiting = false;
    public hasError = false;

    public dataForm = this.formBuilder.group({
        description: [''],
        unitId: [''],
        uuid: [{
            value: null,
            disabled: true
        }],
    });

    constructor(
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private compositeTermService: CompositeTermService,
        private supportListService: SupportListService,
        private authService: AuthService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
        this.subscribeToUserStatus();
        this.subscribeToActiveTerm();
        this.subscribeToFormChanges();
        this.initializeSupportList();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
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
                // any user who's logged in should be able to create/edit terms
                this.isEditable = currentUser.isLoggedIn();
            });
    }

    /**
     * Subscribe to the active composite term observable.
     */
    private subscribeToActiveTerm(): void {
        this.compositeTermService.selectedTermSubject
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            console.log(`${this.constructor.name}: received new composite term`, compositeTerm);
            this.compositeTerm = compositeTerm;
            this.setFormData();
        })
    }

    /**
     * Load the list of Bedes Units.
     */
    private initializeSupportList(): void {
        // subscribe to the unit list observable
        this.supportListService.unitListSubject.subscribe(
            (results: Array<BedesUnit>) => {
                this.unitList = results;
            }
        );
    }

    public openTermSearchDialog(): void {
        const dialogRef = this.dialog.open(BedesTermSearchDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '80%',
            position: {top: '20px'},
            data: <ISearchDialogOptions>{
                excludeResultType: [SearchResultType.CompositeTerm],
                excludeUUID: this.compositeTerm.items.map((d) => d.term.uuid),
                showOnlyUUID: true
            }
        });
        dialogRef.afterClosed().subscribe((result: Array<BedesSearchResult>) => {
            if (result && Array.isArray(result) && result.length) {
                this.addSearchResultsToTerm(result);
            }
        });
    }

    /**
     * Add the array of BedesSearchResult items to the composite term.
     */
    private addSearchResultsToTerm(searchResults: Array<BedesSearchResult>): void {
        // create an array of the new uuids to add
        const requestParams = new Array<ICompositeTermDetailRequestParam>();
        // create a new array of only the new uuids we want to get from the backend
        searchResults.forEach(
            (searchResult: BedesSearchResult) => {
                // make sure at least the term uuid is there.
                if (!searchResult.uuid) {
                    throw new Error(`addSearchResultsToTerm expects uuids on all terms, none found`);
                }
                requestParams.push(<ICompositeTermDetailRequestParam>{
                    termUUID: searchResult.termUUID || searchResult.uuid,
                    listOptionUUID: searchResult.termUUID ? searchResult.uuid : undefined
                });
            }
        );
        // call the term service to get the load the terms associated with the uuids
        this.compositeTermService.getCompositeTermDetailRequest(requestParams)
        .subscribe(
            (results: Array<CompositeTermDetailRequestResult>) => {
                this.addDetailItemsFromRequestInfo(results);
            },
            (error: any) => {
                console.log('Error retrieving terms from backend');
                console.log(error);
            }
        );
    }

    /**
     * Add the results from the termDetailRequest into the current CompositeTerm.
     */
    private addDetailItemsFromRequestInfo(requestResults: Array<CompositeTermDetailRequestResult>): void {
        if (!requestResults || !Array.isArray(requestResults)) {
            throw new Error(`addDetailItemsFromRequestInfo expected valid requestResults`);
        }
        requestResults.forEach(((item: CompositeTermDetailRequestResult) => {
            if (item.term && item.listOption) {
                // add both the term and list option
                this.compositeTerm.addBedesTerm(item.term, false, item.listOption);
            }
            else if (item.term && !item.listOption) {
                // add the term only
                this.compositeTerm.addBedesTerm(item.term);
            }
        }));
        this.compositeTermService.setActiveCompositeTerm(this.compositeTerm);
    }

    /**
     * Set the form values from the compositeTerm.
     */
    private setFormData(): void {
        // Description
        this.dataForm.controls['description'].setValue(
            this.compositeTerm ? this.compositeTerm.description : undefined
        );
        this.dataForm.controls['unitId'].setValue(
            this.compositeTerm ? this.compositeTerm.unitId : undefined
        );
        this.dataForm.controls['uuid'].setValue(
            this.compositeTerm ? this.compositeTerm.uuid : undefined
        );
    }

    private subscribeToFormChanges(): void {
        // description
        this.dataForm.controls['description'].valueChanges
        .subscribe((newValue: string) => {
            if (this.compositeTerm) {
                this.compositeTerm.description = newValue || undefined;
            }
        });
        // unit id
        this.dataForm.controls['unitId'].valueChanges
        .subscribe((newValue: string) => {
            if (this.compositeTerm && newValue) {
                this.compositeTerm.unitId = +newValue
            }
        });
    }

    /**
     * Save the composite term to the database.
     */
    public updateCompositeTerm(): void {
        this.isWaiting = true;
        if (this.compositeTerm.id) {
            // an existing term
            this.compositeTermService.updateTerm(this.compositeTerm)
            .subscribe((results: BedesCompositeTerm) => {
                this.isWaiting = false;
                this.compositeTermService.setActiveCompositeTerm(results);
            }, (error: any) => {
                this.isWaiting = false;
                this.hasError = true;
            });
        }
        else {
            // new term, save it to the database.
            this.compositeTermService.saveNewTerm(this.compositeTerm)
            .subscribe((results: BedesCompositeTerm) => {
                this.isWaiting = false;
                this.compositeTermService.setActiveCompositeTerm(results);
                this.router.navigate([results.uuid], {relativeTo: this.activatedRoute})
            }, (error: any) => {
                this.isWaiting = false;
                this.hasError = true;
            });
        }
    }

    /**
     * Determines if the current CompositeTerm has any
     * terms included.
     * @returns true if there are BEDES terms included in the definition.
     */
    public hasSelectedTerms(): boolean {
        return this.compositeTerm && this.compositeTerm.items.length
            ? true
            : false;
    }
}
