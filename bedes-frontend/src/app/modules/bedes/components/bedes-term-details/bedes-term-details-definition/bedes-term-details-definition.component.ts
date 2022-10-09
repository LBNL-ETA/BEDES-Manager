import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { Subject } from 'rxjs';
import { BedesDefinitionSource } from '@bedes-common/models/bedes-definition-source';
import { BedesSectorValues } from '@bedes-common/enums/bedes-sector.enum';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-bedes-term-details-definition',
  templateUrl: './bedes-term-details-definition.component.html',
  styleUrls: ['./bedes-term-details-definition.component.scss']
})
export class BedesTermDetailsDefinitionComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    public term: BedesTerm | BedesConstrainedList | undefined;
    public unitList: Array<BedesUnit>;
    public dataTypeList: Array<BedesDataType>;
    public categoryList: Array<BedesTermCategory>;
    public definitionSourceList: Array<BedesDefinitionSource>;

    public isEditable: boolean;
    /* The current user */
    public currentUser: CurrentUser;


    public dataForm = this.formBuilder.group({
        name: [{value: null, disabled: true}, Validators.required],
        description: [{value: null, disabled: true}],
        dataTypeId: [{value: null, disabled: true}, Validators.required],
        unitId: [{value: null, disabled: true}],
        definitionSourceId: [{value: null, disabled: true}],
        termCategoryId: [{value: null, disabled: true}],
        uuid: [{
            value: null,
            disabled: true
        }],
        url: [{value: null, disabled: true}],
        sectorCommercial: [{value: null, disabled: true}],
        sectorResidential: [{value: null, disabled: true}],
        sectorMultifamily: [{value: null, disabled: true}]
      });

    constructor(
        private formBuilder: UntypedFormBuilder,
        private termService: BedesTermService,
        private authService: AuthService,
        private supportListService: SupportListService
    ) {
    }

    ngOnInit() {
        this.subscribeToUserStatus();
        this.initializeSupportLists();
        this.termService.selectedTermSubject
            .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
                this.term = selectedTerm;
                this.setFormValues();
            });
        this.watchForChanges();
        // const routeParams = this.route.snapshot.params;
        // this.loadBedesTerm(Number(routeParams.id));
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
                this.currentUser = currentUser;
                this.isEditable = currentUser.isAdmin();
            });
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
        this.supportListService.definitionSourceSubject.subscribe(
            (results: Array<BedesDefinitionSource>) => {
                this.definitionSourceList = results;
            }
        );
    }

    private setFormValues(): void {
        this.dataForm.controls['name'].setValue(
            this.term.name
        );
        this.dataForm.controls['description'].setValue(
            this.term.description
        );
        this.dataForm.controls['uuid'].setValue(
            this.term.uuid
        );
        this.dataForm.controls['url'].setValue(
            this.term.url
        );
        this.dataForm.controls['dataTypeId'].setValue(
            this.term.dataTypeId
        );
        this.dataForm.controls['unitId'].setValue(
            this.term.unitId
        );
        this.dataForm.controls['definitionSourceId'].setValue(
            this.term.definitionSourceId
        );
        this.dataForm.controls['termCategoryId'].setValue(
            this.term.termCategoryId
        );
        this.dataForm.controls['sectorCommercial'].setValue(
            this.term.sectors.hasCommercial()
        );
        this.dataForm.controls['sectorResidential'].setValue(
            this.term.sectors.hasResidential()
        );
        this.dataForm.controls['sectorMultifamily'].setValue(
            this.term.sectors.hasMultifamily()
        );
    }

    private watchForChanges(): void {
        this.dataForm.controls['name'].valueChanges.subscribe(
            (results: string) => {
                if (results) {
                    this.term.name = results;
                }
                else {
                    this.term.name = undefined;
                }
            }
        );
        this.dataForm.controls['description'].valueChanges.subscribe(
            (results: string) => {
                if (results) {
                    this.term.description = results;
                }
                else {
                    this.term.description = undefined;
                }
            }
        );
        this.dataForm.controls['uuid'].valueChanges.subscribe(
            (results: string) => {
                if (results) {
                    this.term.uuid = results;
                }
                else {
                    this.term.uuid = undefined;
                }
            }
        );
        this.dataForm.controls['url'].valueChanges.subscribe(
            (results: string) => {
                if (results) {
                    this.term.url = results;
                }
                else {
                    this.term.url = undefined;
                }
            }
        );
        this.dataForm.controls['dataTypeId'].valueChanges.subscribe(
            (results: string) => {
                if (results) {
                    this.term.dataTypeId = +results;
                }
                else {
                    this.term.dataTypeId = undefined;
                }
            }
        );
        this.dataForm.controls['unitId'].valueChanges.subscribe(
            (results: string) => {
                if (results) {
                    this.term.unitId = +results;
                }
                else {
                    this.term.unitId = undefined;
                }
            }
        );
        this.dataForm.controls['definitionSourceId'].valueChanges.subscribe(
            (results: string) => {
                if (results) {
                    this.term.definitionSourceId = +results;
                }
                else {
                    this.term.definitionSourceId = undefined;
                }
            }
        );
        this.dataForm.controls['termCategoryId'].valueChanges.subscribe(
            (results: string) => {
                if (results) {
                    this.term.termCategoryId = +results;
                }
                else {
                    this.term.termCategoryId = undefined;
                }
            }
        );
        this.dataForm.controls['sectorCommercial'].valueChanges.subscribe(
            (results: boolean) => {
                this.term.sectors.setSector(BedesSectorValues.Commercial, results);
            }
        );
    }

}
