import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SupportListService } from '../../../../services/support-list/support-list.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { OptionViewState } from '../../option-view-state.enum';
import { BedesTermListOptionService } from '../../../../services/bedes-term-list-option/bedes-term-list-option.service';
import { BedesTermService } from 'src/app/modules/bedes/services/bedes-term/bedes-term.service';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { IBedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option.interface';
import { BedesTermOption } from '../../../../../../../../../bedes-common/models/bedes-term-option/bedes-term-option';
import { takeUntil } from 'rxjs/operators';
import { deserializeUser } from 'passport';

enum RequestStatus {
    Idle=1,
    Pending=2,
    Success=3,
    Error=4
}
enum ControlState {
    Normal=1,
    Disabled,
    FormSuccess
}

@Component({
  selector: 'app-edit-term-list-option',
  templateUrl: './edit-term-list-option.component.html',
  styleUrls: ['./edit-term-list-option.component.scss']
})
export class EditTermListOptionComponent implements OnInit {
    public term: BedesTerm | BedesConstrainedList | undefined;
    public listOption: BedesTermOption | undefined;
    // contains the status of the current request status
    public currentRequestStatus = RequestStatus.Idle;
    public RequestStatus = RequestStatus;
    // controls the current state of of the form controls
    public currentControlState = ControlState.Normal;
    public ControlState = ControlState;

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    @Input()
    private stateChangeSubject: BehaviorSubject<OptionViewState>;

    private unitList: Array<BedesUnit>;

    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: [''],
        unitId: ['', Validators.required],
      });

    constructor(
        private formBuilder: FormBuilder,
        private supportListService: SupportListService,
        private termService: BedesTermService,
        private listOptionService: BedesTermListOptionService
    ) { }

    ngOnInit() {
        this.initializeSupportLists();
        this.assignFormValues();
        this.termService.selectedTermSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
                console.log(`${this.constructor.name}: selectedTerm`, selectedTerm);
                this.term = selectedTerm;
            });
        this.listOptionService.activeListOptionSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((selectedOption: BedesTermOption | undefined) => {
                console.log(`${this.constructor.name}: selectedOption`, selectedOption);
                this.listOption = selectedOption;
                this.assignFormValues();
            });

    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
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
    }

    /**
     * Assign initial values to the form.
     */
    private assignFormValues(): void {
        // Set the initial unit to n/a
        // TODO: setup an enum for the Unit n/a value
        if (this.listOption) {
            this.dataForm.controls.name.setValue(this.listOption.name);
            this.dataForm.controls.description.setValue(this.listOption.description);
            this.dataForm.controls.unitId.setValue(this.listOption.unitId);
        }
        else {
            this.dataForm.controls.unitId.setValue(1);
        }
    }

    /**
     * Updates the data model with the values from the form.
     */
    private updateDataModel(): void {
        this.listOption.name = this.dataForm.value.name;
        this.listOption.description = this.dataForm.value.description;
        this.listOption.unitId = this.dataForm.value.unitId;
        this.listOption.definitionSourceId = this.dataForm.value.definitionSourceId;
    }

    /**
     * Update the new list option.
     */
    public updateListOption(): void {
        // set the current request state to Pending
        this.currentRequestStatus = RequestStatus.Pending;
        // set the control state to Disabled
        this.currentControlState = ControlState.Disabled;
        // update the data model with values from the form
        this.updateDataModel();
        // call the API service
        this.listOptionService.updateListOption(this.listOption)
        .subscribe(
            (listOption: BedesTermOption) => {
                this.currentRequestStatus = RequestStatus.Success;
                console.log(`${this.constructor.name}: createNewListOption success`, listOption);
                this.currentControlState = ControlState.Normal;
                // this.dataForm.controls.name.disable();
                // this.dataForm.disable();
            },
            (error: Error) => {
                console.log(`${this.constructor.name}: error creating the new list option`);
                this.currentRequestStatus = RequestStatus.Error;
                this.currentControlState = ControlState.Normal;
            }
        );
    }

    /**
     * Change the view back to ListOptionsView
     */
    public back(): void {
        this.stateChangeSubject.next(OptionViewState.ListOptionsView);
    }

    /**
     * Determines if the form controls should currently be disabled.
     */
    public controlsDisabled(): boolean {
        return this.currentControlState === ControlState.Disabled || this.currentControlState === ControlState.FormSuccess ? true : false;
    }
}
