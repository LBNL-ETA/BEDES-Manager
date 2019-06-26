import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { TableCellMessageType } from '../enums/table-cell-message-type.enum';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-table-cell-delete',
  templateUrl: './table-cell-delete.component.html',
  styleUrls: ['./table-cell-delete.component.scss']
})
export class TableCellDeleteComponent implements ICellRendererAngularComp {

    public params: any;
    public displayLabel: string;
    public MessageType = TableCellMessageType;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public isEditable = false;

    constructor(
    ) {
    }

    private setCellState(cellParamData: any): void {
        this.isEditable = cellParamData.isEditable ? true : false;
    }

    /**
     * Send a message to the grid parent to remove the selected item.
     */
    public removeItem(): void {
        this.sendMessageToParent(TableCellMessageType.Remove);
    }

    /**
     * Calls the viewTerm method of the parent component.
     */
    private sendMessageToParent(messageType: TableCellMessageType): void {
        if (this.params && this.params.context) {
            this.params.context.parent.messageFromGrid(messageType, this.params.data);
        }
    }

    agInit(params: any): void {
        this.params = params;
        this.setCellState(params ? params.data : undefined);
    }

    refresh(): boolean {
        return false;
    }

}
