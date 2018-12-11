import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions, ColDef, ValueGetterParams, SelectionChangedEvent } from 'ag-grid-community';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bedes-term-details-list-options',
  templateUrl: './bedes-term-details-list-options.component.html',
  styleUrls: ['./bedes-term-details-list-options.component.scss']
})
export class BedesTermDetailsListOptionsComponent implements OnInit {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    @ViewChild('agGrid')
    agGrid: AgGridNg2;
    // grid options
    public gridOptions: GridOptions;
    private gridInitialized = false;

    public term: BedesTerm | BedesConstrainedList | undefined;
    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;

    constructor(
        private termService: BedesTermService,
        private supportListService: SupportListService
    ) {
    }

    ngOnInit() {
        this.initializeSupportLists();
        this.initializeGrid();
        this.subscribeToSelectedTerm();
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
            }
        );
        this.supportListService.dataTypeSubject.subscribe(
            (results: Array<BedesDataType>) => {
                this.dataTypeList = results;
                console.log('data types', this.dataTypeList);
            }
        );
        this.supportListService.termCategorySubject.subscribe(
            (results: Array<BedesTermCategory>) => {
                this.categoryList = results;
            }
        );
    }

    private initializeGrid(): void {
        console.log('%c set grid options', 'background-color: dodgerblue');
        this.gridOptions = <GridOptions>{
            enableRangeSelection: true,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            rowSelection: 'multiple',
            rowDragManaged: true,
            animateRows: true,
            columnDefs: this.buildColumnDefs(),
            getRowNodeId: (data: any) => {
                return data.id;
            },
            onGridReady: () => {
                console.log('%c grid is ready', 'background-color: dodgerblue');
                this.setGridData();
                // this.initialRowDataLoad$.subscribe(
                //     rowData => {
                //         // the initial full set of data
                //         // note that we don't need to un-subscribe here as it's a one off data load
                //         if (this.gridOptions.api) { // can be null when tabbing between the examples
                //             this.gridOptions.api.setRowData(rowData);
                //         }

                //         // now listen for updates
                //         // we process the updates with a transaction - this ensures that only the changes
                //         // rows will get re-rendered, improving performance
                //         this.rowDataUpdates$.subscribe((updates) => {
                //             if (this.gridOptions.api) { // can be null when tabbing between the examples
                //                 this.gridOptions.api.updateRowData({update: updates})
                //             }
                //         });
                //     }
                // );
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            // onSelectionChanged: (event: SelectionChangedEvent) => {
            //     console.log('selection changed', event.api.getSelectedRows());
            //     this.termSelectorService.setSelectedTerms(event.api.getSelectedRows());
            //     this.selectedTerms = event.api.getSelectedRows();
            // }
        };
    }

    /**
     * Subscribe to the selected term BehaviorSubject.
     */
    private subscribeToSelectedTerm(): void {
        this.termService.selectedTermSubject
            .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
                console.log(`%c ${this.constructor.name}: selectedTerm`, 'background-color: dodgerblue; color: white; padding: 5px;', selectedTerm);
                this.term = selectedTerm;
                this.setGridData();
            });
    }

    private setGridData(): void {
        if (this.gridOptions.api && this.term) {
            console.log('set the grid data', this.term, this.term instanceof BedesConstrainedList);
            if (this.term instanceof BedesConstrainedList) {
                console.log('%c set row data to ', 'background-color: dodgerblue; color: white; padding: 5px;', this.term.options);
                this.gridOptions.api.setRowData(this.term.options);
            }
            else {
                this.gridOptions.api.setRowData([]);
            }
            this.gridInitialized = true;
        }

    }

    private buildColumnDefs(): Array<ColDef> {
        return [
            {headerName: 'Name', field: 'name', rowDrag: true},
            {headerName: 'Description', field: 'description'},
            {
                headerName: 'Term Category',
                field: 'termCategoryId',
                valueGetter: (params: ValueGetterParams) => {
                    if (this.categoryList) {
                        const item = this.categoryList.find((d) => d.id === params.data.termCategoryId);
                        if (item) {
                            return item.name;
                        }
                    }
                }
            },
            {headerName: 'Data Type', field: 'dataTypeId'},
            {
                headerName: 'Unit',
                field: 'unitId',
                valueGetter: (params: ValueGetterParams) => {
                    if (this.unitList) {
                        const unit = this.unitList.find((d) => d.id === params.data.unitId);
                        if (unit) {
                            return unit.name;
                        }
                    }
                    return ``;
                }
            },
        ]
    }

}
