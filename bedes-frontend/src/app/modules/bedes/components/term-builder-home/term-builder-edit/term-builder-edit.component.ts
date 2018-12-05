import { Component, OnInit } from '@angular/core';
import { BedesTermSearchDialogComponent } from '../../dialogs/bedes-term-search-dialog/bedes-term-search-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-term-builder-edit',
    templateUrl: './term-builder-edit.component.html',
    styleUrls: ['./term-builder-edit.component.scss']
})
export class TermBuilderEditComponent implements OnInit {

    constructor(
        public dialog: MatDialog
    ) { }

    ngOnInit() {
    }

    public openTermSearchDialog(): void {
        const dialogRef = this.dialog.open(BedesTermSearchDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '650px',
            position: {top: '20px'}
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log('dialogRef.afterClosed()', result);
        });
    }
}
