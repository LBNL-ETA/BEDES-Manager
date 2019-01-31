import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SupportListService } from '../../../../../services/support-list/support-list.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { OptionViewState } from '../../../../../models/list-options/option-view-state.enum';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AppTermListOptionService } from '../../../../../services/app-term-list-option/app-term-list-option.service';
import { AppTermService } from 'src/app/modules/bedes/services/app-term/app-term.service';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { AppTermList } from '@bedes-common/models/app-term/app-term-list';
import { AppTermListOption } from '@bedes-common/models/app-term/app-term-list-option';
import { ApplicationService } from '../../../../../services/application/application.service';
import { MappingApplication } from '@bedes-common/models/mapping-application/mapping-application';

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
  selector: 'app-edit-list-option',
  templateUrl: './edit-list-option.component.html',
  styleUrls: ['./edit-list-option.component.scss']
})
export class EditListOptionComponent implements OnInit {
    // public term: AppTerm | AppTermList | undefined;
    // public listOption: AppTermListOption | undefined;
    // contains the status of the current request status
    public currentRequestStatus = RequestStatus.Idle;
    public RequestStatus = RequestStatus;
    // controls the current state of of the form controls
    public currentControlState = ControlState.Normal;
    public ControlState = ControlState;
    // subject to unsubscribe from subscribed-to-subjects onDestroy
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    // Holds a reference to the active MappingApplication
    private app: MappingApplication | undefined;
    // Holds a reference to the active AppTerm
    private term: AppTerm | AppTermList | undefined;
    // Holds a reference to the active AppTermListOption
    private listOption: AppTermListOption | undefined;
    // Output event for when the *back* button is clicked
    @Output()
    backEvent = new EventEmitter<OptionViewState>();

    public unitList: Array<BedesUnit>;

    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: ['']
      });

    constructor(
        private formBuilder: FormBuilder,
        private supportListService: SupportListService,
        private appService: ApplicationService,
        private termService: AppTermService,
        private listOptionService: AppTermListOptionService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.initializeSupportLists();
        this.subscribeToFormChanges();
        this.subscribeToActiveData();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the active data objects.
     */
    private subscribeToActiveData(): void {
        // subscribe to the active MappingApplication BehaviorSubject
        this.appService.selectedItemSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((app: MappingApplication | undefined) => {
                this.app = app;
            });
        // subscribe to the active AppTerm BehaviorSubject
        this.termService.activeTermSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((appTerm: AppTerm | AppTermList | undefined) => {
                this.term = appTerm;
            });
        // subscribe to the active ListOption BehaviorSubject
        this.listOptionService.activeListOptionSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((activeOption: AppTermListOption | undefined) => {
                this.listOption = activeOption;
                this.assignFormValues();
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
        }
    }

    /**
     * Subscribe to the form changes Observables for each form control.
     */
    private subscribeToFormChanges(): void {
        // this.dataForm.controls.name.valueChanges
        // .subscribe((newValue: any) => {
        //     console.log(`${this.constructor.name}: name changed to ${newValue} (${typeof newValue})`)
        // })
    }

    /**
     * Updates the data model with the values from the form.
     */
    private updateDataModel(): void {
        if (this.listOption) {
            this.listOption.name = this.dataForm.value.name;
            this.listOption.description = this.dataForm.value.description;
        }
    }

    /**
     * Saves the current listOption object, either saving a new one
     * or updating an existing one. If the term being operated on is a new
     * term itself, the whole term is saved.
     */
    public saveListOption(): void {
        if (!this.listOption) {
            throw new Error('Invalid listOption encountered in saveListOption');
        }
        // if the list option is part of a new term need to save the whole term,
        // which also save's the listOption
        if (!this.term.id) {
            this.saveNewAppTerm();
        }
        else if (this.listOption.id) {
            // If there's an id for the object, then update
            this.updateListOption();
        }
        else {
            // save a new object if there's no id
            this.newListOption();
        }
    }

    /**
     * Save the new AppTermList if a new ListOption was attempted to be saved
     * and the term is itself a new AppTermList.
     */
    private saveNewAppTerm(): void {
        console.log(`save a new appTerm`);
        this.termService.newAppTerm(this.app.id, this.term)
        .subscribe((newTerm: AppTerm | AppTermList) => {
            console.log('app term saved', newTerm);
            // update the term's id
            this.term.id = newTerm.id;
            // update the active term BehaviorSubject listeners of the change
            this.termService.setActiveTerm(this.term);
        });
    }

    /**
     * Update the new list option.
     */
    public updateListOption(): void {
        if (!(this.term instanceof AppTermList)) {
            throw new Error(`${this.constructor.name}: updateListOption expected an AppTermList object.`);
        }
        // set the current request state to Pending
        this.currentRequestStatus = RequestStatus.Pending;
        // set the control state to Disabled
        this.currentControlState = ControlState.Disabled;
        // update the data model with values from the form
        this.updateDataModel();
        // call the API service
        this.listOptionService.updateListOption(this.term, this.listOption)
        .subscribe((listOption: AppTermListOption) => {
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
        });
    }

    /**
     * Save's the new AppTermListOption object to the database.
     */
    public newListOption(): void {
        if (!this.listOption) {
            throw new Error('Invalid list option.');
        }
        if (!(this.term instanceof AppTermList)) {
            throw new Error(`${this.constructor.name}: updateListOption expected an AppTermList object.`);
        }
        // set the current request state to Pending
        this.currentRequestStatus = RequestStatus.Pending;
        // set the control state to Disabled
        this.currentControlState = ControlState.Disabled;
        // update the data model with values from the form
        this.updateDataModel();
        // call the API service
        this.listOptionService.newListOption(this.term, this.listOption)
        .subscribe((listOption: AppTermListOption) => {
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
        });
    }

    /**
     * Change the view back to ListOptionsView
     */
    public back(): void {
        // Emit the new desired state to the parent
        this.backEvent.emit(OptionViewState.ListOptionsView);
    }

    /**
     * Determines if the form controls should currently be disabled.
     */
    public controlsDisabled(): boolean {
        return this.currentControlState === ControlState.Disabled || this.currentControlState === ControlState.FormSuccess ? true : false;
    }
}
