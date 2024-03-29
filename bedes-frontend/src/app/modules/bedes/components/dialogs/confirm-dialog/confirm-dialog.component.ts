import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
    public dialogTitle: string;
    public dialogContent: string;
    public dialogHtml: string;
    public headerClass: string;

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData
    ) {
        this.dialogTitle = dialogData.dialogTitle || 'Dialog Title';
        this.dialogContent = dialogData.dialogContent || 'Dialog content....';
        this.dialogHtml = dialogData.dialogHtml ?? null;
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
