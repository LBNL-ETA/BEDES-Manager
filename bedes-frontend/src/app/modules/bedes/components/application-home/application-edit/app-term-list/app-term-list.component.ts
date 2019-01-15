import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { SupportListService } from '../../../../services/support-list/support-list.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { ApplicationService } from '../../../../services/application/application.service';
import { ApplicationScope } from '@bedes-common/enums/application-scope.enum';
// import { TableCellNameNavComponent } from './table-cell-name-nav/table-cell-name-nav.component';
import { AppTerm, AppTermList, IAppTerm } from '@bedes-common/models/app-term';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { AppTermService } from '../../../../services/app-term/app-term.service';
import { TableCellNameNavComponent } from '../../application-list/table-cell-name-nav/table-cell-name-nav.component';
import { TermType } from '@bedes-common/enums/term-type.enum';

/**
 * Interface for the rows of grid objects.
 */
interface IAppRow {
    ref: AppTerm | AppTermList;
    mappedBedesTerm: any;
}

@Component({
  selector: 'app-app-term-list',
  templateUrl: './app-term-list.component.html',
  styleUrls: ['./app-term-list.component.scss']
})
export class AppTermListComponent implements OnInit {
    private gridInitialized: boolean;
    // Boolean that indicates if the grid's data needs to be set.
    // When a new appTermList is received, this flag is set to true
    private gridDataNeedsSet: boolean
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public selectedItem: IAppRow;
    // lists
    private appTermList: Array<AppTerm | AppTermList> | undefined;
    private unitList: Array<BedesUnit>;
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private appTermService: AppTermService
    ) {}

    ngOnInit() {
        this.gridInitialized = false;
        this.gridDataNeedsSet = false;
        this.gridSetup();
        this.setTableContext();
        this.subscribeToAppTermList();
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
    private subscribeToAppTermList(): void {
        this.appTermService.termListSubject
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((termList: Array<AppTerm | AppTermList>) => {
            console.log(`${this.constructor.name}: received app term list`, termList);
            this.appTermList = termList;
            this.gridDataNeedsSet = true;
            this.setGridData();
        });
    }

    /**
     * Create a new AppTerm object, and navigate to the AppTerm route.
     */
    public newTerm(): void {
        const params: IAppTerm = {
            _name: 'New App Term',
            _termTypeId: TermType.Atomic
        }
        const newTerm = new AppTerm(params);
    }

    public newAtomicTerm(): void {
        const params: IAppTerm = {
            _name: 'New App Term',
            _termTypeId: TermType.Atomic
        }
        const newTerm = new AppTerm(params);
        this.appTermService.setActiveTerm(newTerm);
        this.router.navigate(['app-term', 'new']);
    }

    /**
     * Edit the selected AppTerm.
     * Set's the selectedTerm as the active term,
     * and navigates to the AppTerm/edit route.
     */
    public editSelectedTerm(): void {

    }

    /**
     * Remove the selected AppTerm.
     */
    public removeSelectedTerm(): void {
    }

    /**
     * Retrieve the support lists for the view,
     * only the list of applications in this view.
     */
    // private assignSupportListData(): void {
    //     // listen for the applicationList subject
    //     this.supportListService.applicationSubject.subscribe(
    //         (results: Array<MappingApplication>) => {
    //             this.applicationList = results;
    //             this.setGridData();
    //         }
    //     )
    // }

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
                if (this.gridOptions && this.gridOptions.api && this.gridDataNeedsSet) {
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
        console.log(`${this.constructor.name}: edit selected item`, this.selectedItem);
        // set the activeTerm in the service
        this.appTermService.setActiveTerm(this.selectedItem.ref);
        // navigate to the term-edit view
        this.router.navigate([this.selectedItem.ref.id], {relativeTo: this.activatedRoute});
    }

    /**
     * Navigates tot he selected AppTerm object.
     */
    // public viewItem(selectedItem: IAppRow): void {
    //     console.log(`${this.constructor.name}: view term`, selectedItem);
    //     this.router.navigate(['/app-term', selectedItem.ref.id]);
    // }

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
                headerName: 'Mapped BEDES Term Name',
                field: 'mappedBedesTerm.name'
            }
        ];
    }

    /**
     * Populates the grid with the data from the appTermList
     */
    private setGridData() {
        if (this.gridInitialized && this.gridDataNeedsSet) {
            // const gridData = this.applicationList;
            const gridData = new Array<IAppRow>();
            this.appTermList.forEach((app: AppTerm | AppTermList) => {
                gridData.push(<IAppRow>{
                    ref: app,
                    mappedBedesTerm: {name: 'Some mapped BEDES Term'}
                });
            })
            this.gridOptions.api.setRowData(gridData);
            this.gridDataNeedsSet = false;
        }
    }

}

