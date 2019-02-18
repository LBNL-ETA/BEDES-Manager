import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { TableCellMessageType } from '../../../../models/ag-grid/enums/table-cell-message-type.enum';
import { TermStatus } from '../term-status.enum';

/**
 * Component implementation for an ag-grid cell.
 */
@Component({
  selector: 'app-table-cell-app-term-status',
  templateUrl: './table-cell-app-term-status.component.html',
  styleUrls: ['./table-cell-app-term-status.component.scss']
})
export class TableCellAppTermStatusComponent implements ICellRendererAngularComp {
    public params: any;
    public displayLabel: string;
    /** Defines the possible states the AppTerm can be in */
    public TermStatus = TermStatus;
    /** The current term's status */
    public currentTermStatus: TermStatus | undefined;

    private setDisplayLabel(element: any): void {
        if (element && element.termStatus in TermStatus) {
            this.displayLabel = (element.termStatus === TermStatus.New ? 'Term Not Saved' : 'Ok');
            this.currentTermStatus = element.termStatus;
        }
        else {
            this.displayLabel = '';
            this.currentTermStatus = undefined;
        }
    }

    agInit(params: any): void {
        this.params = params;
        this.setDisplayLabel(params ? params.data : undefined);
    }

    refresh(): boolean {
        return false;
    }

    /**
     * Determines if the current AppTerm is new,
     * so needs to be saved to the database.
     */
    public isNewTerm(): boolean {
        return this.currentTermStatus === TermStatus.New;
    }

    /**
     * Determines if the current AppTerm already exists in the database.
     */
    public isExistingTerm(): boolean {
        return !this.isNewTerm();
    }
}
