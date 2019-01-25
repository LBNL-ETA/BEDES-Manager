import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { BedesCompositeTerm } from '@bedes-common/models/bedes-composite-term';
import { CompositeTermService } from '../../../services/composite-term/composite-term.service';
import { AuthService } from '../../../../auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { BedesCompositeTermShort } from '@bedes-common/models/bedes-composite-term-short/bedes-composite-term-short';

interface IGridRow {
    name: string;
    scope: string;
    ref: BedesCompositeTermShort;
}

@Component({
    selector: 'app-composite-term-list',
    templateUrl: './composite-term-list.component.html',
    styleUrls: ['./composite-term-list.component.scss']
})
export class CompositeTermListComponent implements OnInit {
    /* Array that holds the list of CompositeTerms */
    public termList: Array<BedesCompositeTermShort>;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: Array<IGridRow>;
    public tableContext: any;
    // Indicates if the grid has been initialized.
    private gridInitialized = false;
    // Indicates if the grid's data needs to be set
    private gridDataNeedsSet = false;
    // The current selected row
    private selectedItem: IGridRow | undefined;
    /* The current user */
    public currentUser: CurrentUser;
    // Indicates if the CompositeTerms are editable
    public isEditable = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private compositeTermService: CompositeTermService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.subscribeToUserStatus();
        this.subscribeToTermList();
        this.gridSetup();
        this.setTableContext();
    }

    /**
     * Subscribe to the composite term list BehaviorSubject.
     */
    private subscribeToTermList(): void {
        this.compositeTermService.termListSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
            (termList: Array<BedesCompositeTermShort>) => {
                this.termList = termList;
                this.gridDataNeedsSet = true;
                this.setGridData();
            }
        )
    }

    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                console.log(`${this.constructor.name}: received user status`, currentUser);
                this.currentUser = currentUser;
                this.isEditable = currentUser.isLoggedIn();
            });
    }

    /**
     * Setup the ag-grid for the list of projects.
     */
    private gridSetup(): void {
        this.gridOptions = <GridOptions>{
            enableRangeSelection: true,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            // rowSelection: 'multiple',
            columnDefs: this.buildColumnDefs(),
            onGridReady: () => {
                this.gridInitialized = true;
                if (this.gridOptions && this.gridOptions.api) {
                    this.setGridData();
                }
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                console.log('selection changed', event.api.getSelectedRows());
                const rows = event.api.getSelectedRows();
                this.selectedItem = rows && rows.length ? rows[0] : undefined;
            }
        };
    }

    /**
     * Builds the column definitions for the list of projects.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'ref.name',
                checkboxSelection: true
                // minWidth: 250,
                // cellRendererFramework: TableCellNameNavComponent
            },
            {
                headerName: 'Description',
                field: 'ref.description'
            },
            {
                headerName: 'UUID',
                field: 'ref.uuid'
            },
            {
                headerName: 'Scope',
                field: 'scopeName'
            }
        ];
    }

    /**
     * Populates the grid with the data from the applicationList.
     */
    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsSet) {
            const gridData = new Array<IGridRow>();
            if (Array.isArray(this.termList)) {
                this.termList.forEach((item: BedesCompositeTermShort) => {
                    gridData.push(<IGridRow>{
                        name: item.name,
                        ref: item
                    });
                })
            }
            this.gridOptions.api.setRowData(gridData);
            this.gridDataNeedsSet = false;
        }
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
     * View the selected CompositeTerm, which is set from the grid configuration.
     */
    public viewSelectedItem(): void {
        // navigate to the route
        this.router.navigate(['../edit', this.selectedItem.ref.id], { relativeTo: this.route});
    }

}
