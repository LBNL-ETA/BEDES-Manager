import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bedes-term-details-definition',
  templateUrl: './bedes-term-details-definition.component.html',
  styleUrls: ['./bedes-term-details-definition.component.scss']
})
export class BedesTermDetailsDefinitionComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    public term: BedesTerm | BedesConstrainedList | undefined;
    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;

    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: [''],
        dataTypeId: ['', Validators.required],
        unitId: [''],
        definitionSourceId: [''],
        termCategoryId: [''],
      });

    constructor(
        private formBuilder: FormBuilder,
        private termService: BedesTermService,
        private supportListService: SupportListService
    ) {
    }

    ngOnInit() {
        this.initializeSupportLists();
        this.termService.selectedTermSubject
            .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
                console.log(`${this.constructor.name}: selectedTerm`, selectedTerm);
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

    private loadBedesTerm(id: number): void {
        console.log(`load bedes term ${id}`, this.term);
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
                console.log('data types', this.dataTypeList);
            }
        );
        this.supportListService.termCategorySubject.subscribe(
            (results: Array<BedesTermCategory>) => {
                this.categoryList = results;
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
    }

    private watchForChanges(): void {
        this.dataForm.valueChanges.subscribe((results: any) => {
            console.log('dataFormValue changes', results);
        });
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
    }

}
