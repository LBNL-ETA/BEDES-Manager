import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { AppTermService } from '../../../../services/app-term/app-term.service';
import { Subject } from 'rxjs';
import { BedesTermSearchDialogComponent } from '../../../dialogs/bedes-term-search-dialog/bedes-term-search-dialog.component';
import { ISearchDialogOptions } from '../../../dialogs/bedes-term-search-dialog/search-dialog-options.interface';
import { BedesSearchResult } from '@bedes-common/models/bedes-search-result/bedes-search-result';
import { BedesTermService } from '../../../../services/bedes-term/bedes-term.service';
import { CompositeTermService } from '../../../../services/composite-term/composite-term.service';
import { SearchResultType } from '@bedes-common/models/bedes-search-result/search-result-type.enum';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';
import { BedesTerm } from '@bedes-common/models/bedes-term/bedes-term';
import { AppTermListOptionService } from '../../../../services/app-term-list-option/app-term-list-option.service';
import { AppTermListOption } from '@bedes-common/models/app-term/app-term-list-option';

@Component({
    selector: 'app-mapping-view',
    templateUrl: './mapping-view.component.html',
    styleUrls: ['./mapping-view.component.scss']
})
export class MappingViewComponent implements OnInit {
    public isSearchDisplayed = false;
    public activeAppTerm: AppTerm;
    public activeAppListOption: AppTermListOption;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(
        private bedesTermService: BedesTermService,
        private compositeTermService: CompositeTermService,
        private dialog: MatDialog,
        private appTermService: AppTermService,
        private listOptionService: AppTermListOptionService
    ) {
    }

    ngOnInit() {
        this.subscribeToActiveTerm();
        this.subscribeToActiveListOption();
    }

    /**
     * Subscribe to the BehaviorSubject that serves the
     * active Mapping Application's set of AppTerms.
     */
    private subscribeToActiveTerm(): void {
        this.appTermService.activeTermSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((activeTerm: AppTerm | undefined) => {
                this.activeAppTerm = activeTerm;
            });
    }

    /**
     * Subscribe to the active list option BehaviorSubject.
     */
    private subscribeToActiveListOption(): void {
        this.listOptionService.activeListOptionSubject
        .subscribe((listOption: AppTermListOption | undefined) => {
            this.activeAppListOption = listOption
        })
    }

    public showTermSearch(): void {
        this.openTermSearchDialog();
        // this.isSearchDisplayed = true;
    }

    /**
     * Open the dialog to import the mapped BEDES term.
     */
    private openTermSearchDialog(): void {
        // open the dialog
        const dialogRef = this.dialog.open(BedesTermSearchDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '80%',
            position: {top: '20px'},
            data: <ISearchDialogOptions>{
                // excludeResultType: [SearchResultType.CompositeTerm],
                // excludeUUID: this.compositeTerm.items.map((d) => d.term.uuid),
                showOnlyUUID: true
            }
        });
        // After the dialog is close...
        dialogRef.afterClosed()
        .subscribe((results: Array<BedesSearchResult> | undefined) => {
            console.log('dialogRef.afterClosed()', results);
            if (Array.isArray(results) && results.length) {
                this.setMappedTermFromSearchResult(results[0]);
            }
        });
    }

    /**
     * Set's the BEDES term from a BedesSearchResult object.
     */
    private setMappedTermFromSearchResult(searchResult: BedesSearchResult): void {
        if (searchResult.resultObjectType === SearchResultType.CompositeTerm) {
            this.setMappedCompositeTerm(searchResult);
        }
        else {
            this.setMappedAtomicTerm(searchResult);
        }
    }

    /**
     * Maps the active AppTerm to the composite term search result.
     */
    private setMappedCompositeTerm(searchResult: BedesSearchResult): void {
        // only handle composite term requests
        if (searchResult.resultObjectType !== SearchResultType.CompositeTerm) {
            throw new Error('CompositeTerm expected in setMappedCompositeTerm');
        }
        // make sure to get the uuid of the term and not the list option
        this.compositeTermService.getTerm(searchResult.uuid)
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            this.activeAppTerm.map(compositeTerm);
            // received the compositeTerm
            // console.log(`${this.constructor.name}: received the compositeTerm`);
            // // create the new mapping object and assign it to the active appTerm
            // const mapping = new TermMappingComposite()
            // this.activeAppTerm.mapping = mapping;
            // // assign the active AppTermListOption if it's set
            // if (this.activeAppListOption) {
            //     mapping.appListOption = this.activeAppListOption;
            // }
            // // assign the bedesTerm
            // mapping.compositeTerm = compositeTerm;
            // console.log('done', mapping);
        })

    }

    /**
     * Set's the mapped term to a atomic term from a given searchResult.
     */
    private setMappedAtomicTerm(searchResult: BedesSearchResult): void {
        // don't handle composite term requests
        if (searchResult.resultObjectType === SearchResultType.CompositeTerm) {
            throw new Error('setMappedAtomicTerm expected to map an atomic term, composite term found');
        }
        // make sure to get the uuid of the term and not the list option
        const termUUID = searchResult.termUUID ? searchResult.termUUID : searchResult.uuid;
        // get the listOption UUID if there is one
        const optionUUID = searchResult.termUUID && searchResult.uuid ? searchResult.uuid : undefined;
        // get the atomic term from the backend
        this.bedesTermService.getTerm(termUUID)
        .subscribe((bedesTerm: BedesTerm | BedesConstrainedList) => {
            // holds the reference to the mapped BedesTermOption, if applicable
            // let bedesTermOption: BedesTermOption | undefined;
            // if(optionUUID && bedesTerm instanceof BedesConstrainedList) {
            //     // find the matching listOption by UUID
            //     const found = bedesTerm.options.find((item) => item.uuid === optionUUID);
            //     if (found) {
            //         // assign the bedesListOption if there is one
            //         bedesTermOption = found;
            //     }
            //     else {
            //         throw new Error(`Couldn't find term ${optionUUID}`)
            //     }
            // }
            // if (this.appTerm instanceof AppTermList) {
            //     // if this is an appTermList include the activeListOption
            //     this.appTerm.map(bedesTerm, bedesTermOption, this.activeListOption);
            // }
            // else {
            //     this.appTerm.map(bedesTerm, bedesTermOption);

            // }
            // // create the new mapping object and assign it to the active appTerm
            // const mapping = new TermMappingAtomic()
            // this.activeAppTerm.mapping = mapping;
            // // assign the active AppTermListOption if it's set
            // if (this.activeAppListOption) {
            //     mapping.appListOption = this.activeAppListOption;
            // }
            // // assign the bedesTerm
            // mapping.bedesTerm = bedesTerm;
            // // assign the listOption to the mapping
            // if(optionUUID && bedesTerm instanceof BedesConstrainedList) {
            //     // find the matching listOption by UUID
            //     const found = bedesTerm.options.find((item) => item.uuid === optionUUID);
            //     if (found) {
            //         // assign the bedesListOption if there is one
            //         mapping.bedesListOption = found;
            //     }
            //     else {
            //         throw new Error(`Couldn't find term ${optionUUID}`)
            //     }
            // }
            // console.log('done', mapping);
        }, (error: any) => {
            console.error(`${this.constructor.name}: error mapping the atomic term`, error);
        });
    }

    public backFromSearch(): void {
        this.isSearchDisplayed = false;
    }

}
