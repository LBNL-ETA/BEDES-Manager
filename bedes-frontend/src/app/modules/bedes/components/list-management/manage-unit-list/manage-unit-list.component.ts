import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions, ColDef, ValueGetterParams, SelectionChangedEvent } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { Subject } from 'rxjs';
import { BedesUnitService } from '../../../services/bedes-unit/bedes-unit.service';
import { IUsageCount } from '../../../../../../../../bedes-common/interfaces/usage-count.interface';

@Component({
    selector: 'app-manage-unit-list',
    templateUrl: './manage-unit-list.component.html',
    styleUrls: ['./manage-unit-list.component.scss']
})
export class ManageUnitListComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public unitList: Array<BedesUnit>;
    @ViewChild('agGrid') agGrid: AgGridAngular;
    // grid options
    public gridOptions: GridOptions;
    public selectedUnit: BedesUnit | undefined;
    public isReplacing = false;

    constructor(
        private supportListService: SupportListService,
        private unitService: BedesUnitService
    ) { }

    ngOnInit() {
        this.initializeSupportLists();
        this.initializeGrid();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Setup the lists that translates id's into text labels.
     */
    private initializeSupportLists(): void {
        this.supportListService.unitListSubject.subscribe(
            (results: Array<BedesUnit>) => {
                this.unitList = results;
                this.assignGridData(results);
            }
        );
    }

    /**
     * Setup the ag-grid.
     */
    private initializeGrid(): void {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                sortable: true,
                resizable: true,
                filter: true,
            },
            enableRangeSelection: true,
            rowSelection: 'single',
            suppressRowClickSelection: true,
            // suppressCellSelection: true,
            columnDefs: this.buildColumnDefs(),
            getRowNodeId: (data: any) => {
                return data.id;
            },
            onGridReady: () => {
                this.assignGridData(this.unitList);
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                const selection = event.api.getSelectedRows();
                this.selectedUnit = selection.length ? selection[0] : undefined;
            }
        };
    }

    private assignGridData(data: Array<BedesUnit>): void {
        if (this.gridOptions && this.gridOptions.api && data) {
            this.gridOptions.api.setRowData(data);
        }
    }

    private buildColumnDefs(): Array<ColDef> {
        return [
            {headerName: 'Name', field: 'name', checkboxSelection: true },
        ]
    }

    public getUsageCount(): void {
        this.unitService.getUsageCount(this.selectedUnit.id)
        .subscribe((usageCount: IUsageCount) => {
            if (usageCount._usageCount > 0) {
                this.isReplacing = true;
            }
        });
    }


}
