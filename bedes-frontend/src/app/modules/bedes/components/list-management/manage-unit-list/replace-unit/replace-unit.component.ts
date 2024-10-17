import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, GridOptions, ColDef, ValueGetterParams, SelectionChangedEvent } from 'ag-grid-community';
import { SupportListService } from '../../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { Subject } from 'rxjs';
import { BedesUnitService } from '../../../../services/bedes-unit/bedes-unit.service';
import { IUsageCount } from '@bedes-common/interfaces/usage-count.interface';

@Component({
  selector: 'app-replace-unit',
  templateUrl: './replace-unit.component.html',
  styleUrls: ['./replace-unit.component.scss']
})
export class ReplaceUnitComponent implements OnInit {
    @Output() replacementUnit = new EventEmitter<BedesUnit | undefined>();
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public unitList: Array<BedesUnit>;
    @ViewChild('agGrid') agGrid: AgGridAngular;
    // grid options
    public gridOptions: GridOptions;
    private gridApi: GridApi | null = null;
    public selectedUnit: BedesUnit | undefined;

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
            columnDefs: this.buildColumnDefs(),
            getRowNodeId: (data: any) => {
                return data.id;
            },
            onGridReady: (event: GridReadyEvent) => {
                this.gridApi = event.api;
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
        if (this.gridOptions && this.gridApi && data) {
            // this.gridOptions.api.setRowData(data);
            this.gridApi.updateGridOptions({rowData: data});
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
        });
    }


}

