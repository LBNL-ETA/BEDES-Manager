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
    selector: 'app-new-term-list-option',
    templateUrl: './new-term-list-option.component.html',
    styleUrls: ['./new-term-list-option.component.scss']
})
export class NewTermListOptionComponent implements OnInit {
    public term: BedesTerm | BedesConstrainedList | undefined;
    // contains the status of the current request status
    public currentRequestStatus = RequestStatus.Idle;
    public RequestStatus = RequestStatus;
    // controls the current state of of the form controls
    public currentControlState = ControlState.Normal;
    public ControlState = ControlState;

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    @Input()
    private stateChangeSubject: BehaviorSubject<OptionViewState>;

    public unitList: Array<BedesUnit>;

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
            .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
                console.log(`${this.constructor.name}: selectedTerm`, selectedTerm);
                this.term = selectedTerm;
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
        this.dataForm.controls.unitId.setValue(1);
    }

    /**
     * Create the new list option.
     * User the listOptionService to call the API
     */
    public createNewListOption(): void {
        // setup the parameters for the service call
        const newListOption: IBedesTermOption = {
            _name: this.dataForm.value.name,
            _description: this.dataForm.value.description,
            _unitId: this.dataForm.value.unitId
        };
        // set the current request state to Pending
        this.currentRequestStatus = RequestStatus.Pending;
        // set the control state to Disabled
        this.currentControlState = ControlState.Disabled;
        // call the service
        this.listOptionService.newListOption(this.term.id, newListOption)
        .subscribe(
            (results: IBedesTermOption) => {
                this.currentRequestStatus = RequestStatus.Success;
                console.log(`${this.constructor.name}: createNewListOption success`, results);
                this.currentControlState = ControlState.FormSuccess;
                // this.dataForm.controls.name.disable();
                this.dataForm.disable();
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

    public controlsDisabled(): boolean {
        return this.currentControlState === ControlState.Disabled || this.currentControlState === ControlState.FormSuccess ? true : false;
    }
}
