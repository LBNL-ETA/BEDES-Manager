import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-bedes-term-search-dialog',
  templateUrl: './bedes-term-search-dialog.component.html',
  styleUrls: ['./bedes-term-search-dialog.component.scss']
})
export class BedesTermSearchDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<BedesTermSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public param: string) { }

  ngOnInit() {
  }

}
