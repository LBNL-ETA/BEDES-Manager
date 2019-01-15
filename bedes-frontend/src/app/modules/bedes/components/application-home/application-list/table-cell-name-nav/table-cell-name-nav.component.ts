import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { BedesConstrainedList } from '@bedes-common/models/bedes-term/bedes-constrained-list';
import { BedesTerm } from '@bedes-common/models/bedes-term/bedes-term';

/**
 * Component implementation for an ag-grid cell.
 */
@Component({
  selector: 'app-table-cell-name-nav',
  templateUrl: './table-cell-name-nav.component.html',
  styleUrls: ['./table-cell-name-nav.component.scss']
})
export class TableCellNameNavComponent implements ICellRendererAngularComp {
    public params: any;
    public displayLabel: string;

    private setDisplayLabel(element: any): void {
        if (element) {
            this.displayLabel = element.ref.name;
        }
        else {
            this.displayLabel = '';
        }
    }

    /**
     * Calls the viewTerm method of the parent component.
     */
    public viewItem(): void {
        if (this.params && this.params.context) {
            this.params.context.parent.viewItem(this.params.data);
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
