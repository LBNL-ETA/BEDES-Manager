import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
    public dialogTitle: string;
    public dialogContent: string;
    public headerClass: string;

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData
    ) {
        this.dialogTitle = dialogData.dialogTitle || 'Dialog Title';
        this.dialogContent = dialogData.dialogContent || 'Dialog content....';
    }

    ngOnInit() {
    }

    public decline(): void {
        this.dialogRef.close(false);
    }

    public confirm(): void {
        this.dialogRef.close(true);
    }

}
