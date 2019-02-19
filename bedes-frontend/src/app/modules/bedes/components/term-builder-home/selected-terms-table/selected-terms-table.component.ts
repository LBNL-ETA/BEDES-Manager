import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
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
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term/bedes-composite-term';
import { CompositeTermService } from '../../../services/composite-term/composite-term.service';
import { CompositeTermDetail } from '../../../../../../../../bedes-common/models/bedes-composite-term/composite-term-item/composite-term-detail';
import { TableCellItemNameComponent } from './table-cell-item-name/table-cell-item-name.component';
import { SupportListType } from '../../../services/support-list/support-list-type.enum';

interface IGridRow {
    name: string;
    description: string | null | undefined;
    type: string | null | undefined;
    uuid: string;
    dataTypeName: string | null | undefined;
    unitName: string | null | undefined;
    termCategoryName: string | null | undefined;
    ref: CompositeTermDetail
}

@Component({
    selector: 'app-selected-terms-table',
    templateUrl: './selected-terms-table.component.html',
    styleUrls: ['./selected-terms-table.component.scss']
})
export class SelectedTermsTableComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public compositeTerm: BedesCompositeTerm;
    public selectedTerms: Array<BedesTerm | BedesConstrainedList>;
    @ViewChild('agGrid')
    agGrid: AgGridNg2;
    // grid options
    public gridOptions: GridOptions;
    public tableContext: any;
    private gridInitialized = false;
    private gridDataNeedsRefresh = false;

    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;
    private categoryList: Array<BedesTermCategory>;

    constructor(
        private supportListService: SupportListService,
        private termSelectorService: BedesTermSelectorService,
        private dialog: MatDialog,
        private compositeTermService: CompositeTermService
    ) { }

    ngOnInit() {
        this.initializeSupportLists();
        this.initializeGrid();
        this.setTableContext();
        this.subscribeToActiveTerm();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the active composite term observable.
     */
    private subscribeToActiveTerm(): void {
        this.compositeTermService.selectedTermSubject
        .subscribe((compositeTerm: BedesCompositeTerm) => {
            console.log(`${this.constructor.name}: received new composite term`, compositeTerm);
            this.compositeTerm = compositeTerm;
            this.gridDataNeedsRefresh = true;
            this.setGridData();
        })
    }

    /**
     * Set the execution context for the table.  Used for cell renderers
     * to be able to access the parent component methods.
     */
    private setTableContext(): void {
        this.tableContext = {
            parent: this
        };
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
     * Initialize the ag-grid.
     */
    private initializeGrid(): void {
        this.gridOptions = <GridOptions>{
            enableRangeSelection: true,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            // rowSelection: 'multiple',
            // rowDragManaged: true,
            // animateRows: true,
            columnDefs: this.buildColumnDefs(),
            onGridReady: () => {
                this.gridInitialized = true;
                if (this.gridDataNeedsRefresh) {
                    this.setGridData();
                }
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
     * Build the column definitions for the ag-grid.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'name',
                cellRendererFramework: TableCellItemNameComponent
            },
            {
                headerName: 'Description', field: 'description'
            },
            {
                headerName: 'Term Category',
                field: 'termCategoryName',
            },
            {
                headerName: 'Data Type',
                field: 'dataTypeName'
            },
            {
                headerName: 'Unit',
                field: 'unitName'
            },
        ]
    }

    /**
     * Remove the terms selected by the user.
     */
    public removeSelectedItem(gridRow: IGridRow): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '450px',
            position: {top: '20px'},
            data: {
                dialogTitle: 'Confirm?',
                dialogContent: 'Remove the selected terms?',
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.removeDetailItem(gridRow.ref);
            }
        });
    }

    /**
     * Remove the DetailItem from the from the BedesCompositeTerm.
     */
    private removeDetailItem(detailItem: CompositeTermDetail): void {
        this.compositeTerm.removeDetailItem(detailItem);
        this.compositeTermService.setActiveCompositeTerm(this.compositeTerm);
    }

    /**
     * Set's the grid data.
     */
    public setGridData(): void {
        if (this.gridInitialized && this.gridDataNeedsRefresh && this.gridOptions.api) {
            const results = new Array<IGridRow>();
            if  (this.compositeTerm) {
                this.compositeTerm.items.forEach((item: CompositeTermDetail) => {
                    results.push(<IGridRow>{
                        name: item.listOption ? item.listOption.name : item.term.name,
                        description: item.listOption ? item.listOption.description : item.term.description,
                        type: item.listOption ? 'List Option' : 'BEDES Term',
                        ref: item,
                        termCategoryName: this.supportListService.transformIdToName(SupportListType.BedesCategory, item.term.termCategoryId),
                        dataTypeName: this.supportListService.transformIdToName(SupportListType.BedesDataType, item.term.dataTypeId),
                        unitName: this.supportListService.transformIdToName(SupportListType.BedesUnit, item.term.unitId),
                    });
                });
            }
            this.gridOptions.api.setRowData(results);
            this.gridDataNeedsRefresh = false;
        }
    }
}
