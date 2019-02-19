import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MappingTableMessageType } from '../mapping-table-message-type.enum';
import { AppTerm } from '@bedes-common/models/app-term/app-term';
import { TermMappingAtomic } from '@bedes-common/models/term-mapping/term-mapping-atomic';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';

/**
 * Component implementation for an ag-grid cell.
 */
@Component({
  selector: 'app-table-cell-map-list-option',
  templateUrl: './table-cell-map-list-option.component.html',
  styleUrls: ['./table-cell-map-list-option.component.scss']
})
export class TableCellMapListOptionComponent implements ICellRendererAngularComp {
    public params: any;
    public displayLabel: string;
    public MessageType = MappingTableMessageType;
    public appTerm: AppTerm | undefined;
    public showMappingButtons = false;
    public hasMapping = false;
    public mappedName = '';

    private setDisplayLabel(element: any): void {
        if (element) {
            this.displayLabel = element.mappingName;
        }
        else {
            this.displayLabel = '';
        }
    }

    /**
     * Send a message to the grid parent to view the selected item.
     */
    public assignMapping(): void {
        this.sendMessageToParent(MappingTableMessageType.AssignMapping);
    }

    /**
     * Send a message to the grid parent to remove the selected item.
     */
    public removeItem(): void {
        this.sendMessageToParent(MappingTableMessageType.ClearMapping);
    }

    /**
     * Calls the viewTerm method of the parent component.
     */
    private sendMessageToParent(messageType: MappingTableMessageType): void {
        if (this.params && this.params.context) {
            this.params.context.parent.mappingMessageFromGrid(messageType, this.params.data);
        }
    }

    agInit(params: any): void {
        this.appTerm = params ? params.data : undefined;
        this.params = params;
        if (params && params.data) {
            this.showMappingButtons = params.data.showMappingButtons || false;
            this.hasMapping = params.data.hasMapping || false;
            this.mappedName = params.data.mappedName || '';
        }
        this.setDisplayLabel(params ? params.data : undefined);
    }

    refresh(): boolean {
        return false;
    }

}
