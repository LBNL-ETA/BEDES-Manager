import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { TableCellMessageType } from '../table-cell-message-type.enum';

/**
 * Component implementation for an ag-grid cell.
 */
@Component({
  selector: 'app-table-cell-app-term-nav',
  templateUrl: './table-cell-app-term-nav.component.html',
  styleUrls: ['./table-cell-app-term-nav.component.scss']
})
export class TableCellAppTermNavComponent implements ICellRendererAngularComp {
    public params: any;
    public displayLabel: string;
    public MessageType = TableCellMessageType;

    private setDisplayLabel(element: any): void {
        if (element) {
            this.displayLabel = element.ref.name;
        }
        else {
            this.displayLabel = '';
        }
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
        this.setDisplayLabel(params ? params.data : undefined);
    }

    refresh(): boolean {
        return false;
    }

}
