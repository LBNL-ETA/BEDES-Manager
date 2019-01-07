import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { BedesTermSearchService } from '../../../services/bedes-term-search/bedes-term-search.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RequestStatus } from '../../../enums';
import { Router, ActivatedRoute } from '@angular/router';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesTermCategory } from '@bedes-common/models/bedes-term-category/bedes-term-category';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { TableCellTermNameComponent } from '../../bedes-term-search/bedes-search-results-table/table-cell-term-name/table-cell-term-name.component';
import { ApplicationService } from '../../../services/application/application.service';


@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {
    public RequestStatus = RequestStatus;
    public currentRequestStatus: RequestStatus;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private gridInitialized = false;
    public selectedItem: MappingApplication | undefined;
    // lists
    public applicationList: Array<MappingApplication>;
    private unitList: Array<BedesUnit>;
    private categoryList: Array<BedesTermCategory>;
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private termSearchService: BedesTermSearchService,
        private termService: BedesTermService,
        private appService: ApplicationService,
        private supportListService: SupportListService
    ) {}

    ngOnInit() {
        this.gridInitialized = false;
        this.loadApplicationList();
        this.gridSetup();
        this.setTableContext();

    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the application list observable.
     * Set's the initial list, and will update the list
     * whenever the list is updted from the service.
     */
    private loadApplicationList(): void {
        this.appService.appListSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((appList: Array<MappingApplication>) => {
            console.log(`${this.constructor.name}: received app list`, appList);
            this.applicationList = appList;
            this.setGridData();
        });
    }

    /**
     * Retrieve the support lists for the view,
     * only the list of applications in this view.
     */
    private assignSupportListData(): void {
        // listen for the applicationList subject
        this.supportListService.applicationSubject.subscribe(
            (results: Array<MappingApplication>) => {
                this.applicationList = results;
                this.setGridData();
            }
        )
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
            rowSelection: 'multiple',
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
     * Set the execution context for the table.  Used for cell renderers
     * to be able to access the parent component methods.
     */
    private setTableContext(): void {
        this.tableContext = {
            parent: this
        };
    }

    // public viewTerm(selectedItem: any): void {
    //     console.log(`${this.constructor.name}: view the selected item`);
    // }

    /**
     * Remove the application that's currently selected in the table.
     */
    public removeSelectedItem(): void {
        console.log(`${this.constructor.name}: removeSelectedItem`);
    }

    /**
     * Edit the selectedItem App object,
     * ie changes the view to app-edit/:id
     */
    public editSelectedItem(): void {
        console.log(`${this.constructor.name}: edit selected item`, this.selectedItem.id);
        this.router.navigate(['../edit/', this.selectedItem.id], {relativeTo: this.activatedRoute});
    }

    /**
     * Builds the column definitions for the list of projects.
     */
    private buildColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Name',
                field: 'name',
                checkboxSelection: true
                // minWidth: 250,
                // cellRendererFramework: TableCellTermNameComponent
            },
            {
                headerName: 'Description',
                field: 'description'
            }
        ];
    }

    /**
     * Populates the grid with the data from the applicationList.
     */
    private setGridData() {
        if (this.gridOptions && this.gridOptions.api && this.applicationList) {
            const gridData = this.applicationList;
            this.gridOptions.api.setRowData(gridData);
        }
    }

}

