import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-csv-import-info-dialog',
    templateUrl: './csv-import-info-dialog.component.html',
    styleUrls: ['./csv-import-info-dialog.component.scss']
})
export class CsvImportInfoDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<CsvImportInfoDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData
    ) {
    }

    ngOnInit() {
    }

    public importFile(): void {
    }

    public fileSelected(event: any): void {
        if (event && event.srcElement && event.srcElement.files && event.srcElement.files.length) {
            this.selectFile(event.srcElement.files[0]);
        }
    }


    /**
     * Select the file and close the dialog.
     */
    private selectFile(file: any): void {
        this.dialogRef.close(file);
    }

    /**
     * Close the dialog
     */
    public close(): void {
        this.dialogRef.close(undefined);
    }
}
