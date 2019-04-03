import { Component, OnInit } from '@angular/core';
import { SupportListService } from '../../../../services/support-list/support-list.service';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';
import { BedesTerm } from '@bedes-common/models/bedes-term/bedes-term';

/**
 * Component implementation for an ag-grid cell.
 */
@Component({
  selector: 'app-table-cell-item-name',
  templateUrl: './table-cell-item-name.component.html',
  styleUrls: ['./table-cell-item-name.component.scss']
})
export class TableCellItemNameComponent implements ICellRendererAngularComp {
    public params: any;
    public displayLabel: string;
    public uuid: string;
    public isEditable = false;

    private setDisplayLabel(element: BedesTerm | BedesConstrainedList | undefined): void {
        if (element) {
            this.displayLabel = element.name;
            this.uuid = element.uuid;
        }
        else {
            this.displayLabel = '';
            this.uuid = undefined;
        }
    }

    public viewTerm(): void {
        if (this.params && this.params.context) {
            console.log(this.params);
            this.params.context.parent.removeSelectedItem(this.params.data);
        }
    }

    agInit(params: any): void {
        this.params = params;
        this.setDisplayLabel(params ? params.data : undefined);
        this.updateEditStatus();
    }

    refresh(): boolean {
        return false;
    }

    /**
     * Determines if the cell should be editable or not.
     */
    private updateEditStatus(): void {
        if (this.params && this.params.data) {
            this.isEditable = this.params.data.isEditable;
        }
        else {
            this.isEditable = false;
        }
    }

}
