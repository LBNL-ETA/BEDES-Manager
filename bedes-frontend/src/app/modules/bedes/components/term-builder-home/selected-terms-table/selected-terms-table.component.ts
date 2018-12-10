import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions, ColDef, ValueGetterParams, SelectionChangedEvent } from 'ag-grid-community';
import { BedesTermSelectorService } from '../../../services/bedes-term-selector/bedes-term-selector.service';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-selected-terms-table',
    templateUrl: './selected-terms-table.component.html',
    styleUrls: ['./selected-terms-table.component.scss']
})
export class SelectedTermsTableComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private selectedTerms: Array<BedesTerm | BedesConstrainedList>;
    @ViewChild('agGrid')
    agGrid: AgGridNg2;
    // grid options
    public gridOptions: GridOptions;

    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;

    constructor(
        private supportListService: SupportListService,
        private termSelectorService: BedesTermSelectorService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.initializeSupportLists();
        this.initializeGrid();
        this.initTermSelectorSubscriber();
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
            }
        );
        this.supportListService.termCategorySubject.subscribe(
            (results: Array<BedesTermCategory>) => {
                this.categoryList = results;
            }
        );
    }

    /**
     * subscribe to the select terms subject.
     */
    private initTermSelectorSubscriber(): void {
        this.termSelectorService.selectedTermsSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((results: Array<BedesTerm | BedesConstrainedList>) => {
                console.log(`${this.constructor.name}: received search results...`, results);
                this.selectedTerms = results;
                if (this.gridOptions.api) {
                    this.gridOptions.api.setRowData(results);
                }
            },
            (error: any) => {
                console.error(`${this.constructor.name}: error in ngOnInit`)
                console.error(error);
                throw error;
            });
    }

    private initializeGrid(): void {
        this.gridOptions = <GridOptions>{
            enableRangeSelection: true,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            rowSelection: 'multiple',
            columnDefs: this.buildColumnDefs(),
            getRowNodeId: (data: any) => {
                return data.id;
            },
            onGridReady: () => {
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

    private buildColumnDefs(): Array<ColDef> {
        return [
            {headerName: 'Name', field: 'name', checkboxSelection: true },
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

    /**
     * Remove the terms selected by the user.
     */
    public removeSelectedTerms(): void {
        console.log('remove selected terms');
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '650px',
            position: {top: '20px'},
            data: {
                dialogTitle: 'Confirm?',
                dialogContent: 'Remove the selected terms?',
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log('dialogRef.afterClosed()', result);
        });
    }
}
