import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { TableCellMessageType } from '../enums/table-cell-message-type.enum';
import { Subject } from 'rxjs';

/**
 * Component implementation for an ag-grid cell.
 */
@Component({
  selector: 'app-table-cell-nav',
  templateUrl: './table-cell-nav.component.html',
  styleUrls: ['./table-cell-nav.component.scss']
})
export class TableCellNavComponent implements ICellRendererAngularComp {
    public params: any;
    public displayLabel: string;
    public MessageType = TableCellMessageType;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public isEditable = false;

    constructor(
    ) {
    }

    private setDisplayLabel(element: any): void {
        if (element) {
            this.displayLabel = element.ref.name;
        }
        else {
            this.displayLabel = '';
        }
    }

    private setCellState(cellParamData: any): void {
        this.setDisplayLabel(cellParamData);
        this.isEditable = cellParamData.isEditable ? true : false;
    }

    /**
     * Send a message to the grid parent to view the selected item.
     */
    public viewItem(): void {
        this.sendMessageToParent(TableCellMessageType.View);
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
        // this.setDisplayLabel(params ? params.data : undefined);
        this.setCellState(params ? params.data : undefined);
    }

    refresh(): boolean {
        return false;
    }

}
