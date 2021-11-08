import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormBuilder } from '@angular/forms';
import { AppTermListOption } from '@bedes-common/models/app-term/app-term-list-option';

export interface INewListOption {
    name: string;
    description: string | undefined;
}

@Component({
  selector: 'app-new-list-option-dialog',
  templateUrl: './new-list-option-dialog.component.html',
  styleUrls: ['./new-list-option-dialog.component.scss']
})
export class NewListOptionDialogComponent implements OnInit {
    public listOption: AppTermListOption
    public dataForm = this.formBuilder.group({
        name: ['', Validators.required],
        description: [''],
        uuid: [{
            value: null,
            disabled: true
        }],
      });

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<NewListOptionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData
    ) {
    }

    ngOnInit() {
    }

    /**
     * Retrieve the values from the form
     * @returns form values
     */
    private getFormValues(): INewListOption {
        // Make sure the form is valid
        if (!this.dataForm.valid) {
            throw new Error('Expected dataForm to be valid');
        }
        return <INewListOption>{
            name: this.dataForm.value.name,
            description: this.dataForm.value.description || undefined
        }
    }

    /**
     * Close the dialog, don't pass any data back
     */
    public decline(): void {
        this.dialogRef.close(undefined);
    }

    /**
     * Close the dialog, returning the new list option
     */
    public confirm(): void {
        const newListOption = this.getFormValues();
        this.dialogRef.close(newListOption);
    }

}
