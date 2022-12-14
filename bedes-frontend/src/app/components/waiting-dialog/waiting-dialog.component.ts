import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

// import { InvalidParametersError } from 'app/exceptions/invalid-parameters';

@Component({
  selector: 'app-waiting-dialog',
  templateUrl: './waiting-dialog.component.html',
  styleUrls: ['./waiting-dialog.component.css']
})
export class WaitingDialogComponent implements OnInit {
    public heading: string;
    public question_text: string;

    constructor(
        public dialogRef: MatDialogRef<WaitingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        // if (!(this.confirmData instanceof ConfirmDialogData)) {
        //     throw new InvalidParametersError('Invalid parameters given to the ConfirmDialogComponent');
        // }
        // this.assignInitialValues();
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }

    // public assignInitialValues(): void {
    //     this.heading = this.confirmData.heading;
    //     this.question_text = this.confirmData.question_text;
    // }

    public ok(): void {
        this.dialogRef.close(true);
    }

    public cancel(): void {
        this.dialogRef.close(false);
    }
}
