import { Component, OnInit } from '@angular/core';
import { SupportListService } from '../../../../services/support-list/support-list.service';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-table-cell-bedes-data-type',
  templateUrl: './table-cell-bedes-data-type.component.html',
  styleUrls: ['./table-cell-bedes-data-type.component.scss']
})
export class TableCellBedesDataTypeComponent implements OnInit {
    public list: Array<BedesTermCategory>;
    public params: any;
    public displayLabel: string;

    constructor(
        private supportListService: SupportListService
    ) { }

    ngOnInit() {
        this.supportListService.termCategorySubject.subscribe(
            (results: Array<BedesTermCategory>) => {
                this.list = results;
                this.setDisplayLabel();
            }
        )
    }

    private setDisplayLabel(): void {
        if (this.params && this.list && this.params.value) {
            const item = this.list.find((d) => d.id === this.params.value);
            this.displayLabel = item ? item.name : '';
        }
        else {
            this.displayLabel = '';
        }
    }

    agInit(params: any): void {
        this.params = params;
        this.setDisplayLabel();
    }

    refresh(): boolean {
        return false;
    }

}
