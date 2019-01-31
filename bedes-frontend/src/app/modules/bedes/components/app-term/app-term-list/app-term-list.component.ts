import { Component, OnInit, OnDestroy } from '@angular/core';
import { BedesConstrainedList, BedesTerm } from '@bedes-common/models/bedes-term';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { GridOptions, SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { MappingApplication } from '@bedes-common/models/mapping-application';
import { ApplicationService } from '../../../services/application/application.service';
import { ApplicationScope } from '@bedes-common/enums/application-scope.enum';
// import { TableCellNameNavComponent } from './table-cell-name-nav/table-cell-name-nav.component';
import { AppTerm, AppTermList, IAppTerm } from '@bedes-common/models/app-term';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { AppTermService } from '../../../services/app-term/app-term.service';
import { TableCellNameNavComponent } from '../../application-home/application-list/table-cell-name-nav/table-cell-name-nav.component';
import { TermType } from '@bedes-common/enums/term-type.enum';
import { TableCellAppTermNavComponent } from './table-cell-app-term-nav/table-cell-app-term-nav.component';
import { TableCellMessageType } from './table-cell-message-type.enum';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

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
    // the active MappingApplication
    public app: MappingApplication;
    // the selected row in the grid,
    // ie the selected AppTerm (row.ref)
    public selectedItem: IAppRow;
    // lists
    public appTermList: Array<AppTerm | AppTermList> | undefined;
    private unitList: Array<BedesUnit>;
    // ag-grid
    public gridOptions: GridOptions;
    public rowData: Array<BedesTerm | BedesConstrainedList>;
    public tableContext: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private activatedRoute: ActivatedRoute,
        private appService: ApplicationService,
        private appTermService: AppTermService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.gridInitialized = false;
        this.gridDataNeedsSet = false;
        this.gridSetup();
        this.setTableContext();
        this.subscrbeToApplicationData();
        this.subscribeToAppTermList();
    }

    ngOnDestroy() {
        // unsubscribe from the subjects
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * Subscribe to the active MappingApplication object.
     */
    private subscrbeToApplicationData(): void {
        this.appService.selectedItemSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((app: MappingApplication) => {
                this.app = app;
            });
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
        this.router.navigate(['new'], {relativeTo: this.route});
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
     * Confirm the removal of an AppTerm before calling the backend API.
     */
    private confirmRemoveSelectedItem(appTerm: AppTerm | AppTermList): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            panelClass: 'dialog-no-padding',
            width: '450px',
            position: {top: '20px'},
            data: {
                dialogTitle: 'Confirm?',
                dialogContent: 'Remove the selected terms?',
            }
        });
        dialogRef.afterClosed().subscribe((results: boolean) => {
            console.log('dialogRef.afterClosed()', results);
            if (results) {
                this.removeSelectedItem(appTerm);
            }
        });
    }

    /**
     * Remove the application that's currently selected in the table.
     */
    private removeSelectedItem(appTerm: AppTerm | AppTermList): void {
        // get the reference to the selected AppTerm, if there is one
        if (appTerm && appTerm.id) {
            // remove the term
            this.appTermService.removeTerm(this.app.id, appTerm)
            .subscribe((results: number) => {
                console.log(`${this.constructor.name}: delete appTerm success`, results);
            }, (error: any) => {
                console.log('An error occurred removing AppTerm', error);
            });
        }
        else {
            throw new Error('removeSelectedItem expected a valid AppTerm and id');
        }
    }

    /**
     * Edit the selectedItem App object,
     * ie changes the view to app-edit/:id
     */
    private editSelectedItem(appTerm: AppTerm | AppTermList): void {
        console.log(`${this.constructor.name}: edit selected item`, appTerm);
        // set the activeTerm in the service
        this.appTermService.setActiveTerm(appTerm);
        // navigate to the term-edit view
        this.router.navigate([this.selectedItem.ref.id], {relativeTo: this.activatedRoute});
    }

    /**
     * Receives messages from the grid from interactions with AppTerm row buttons.
     */
    public messageFromGrid(messageType: TableCellMessageType, selectedRow: IAppRow): void {
        console.log(`${this.constructor.name}: received message from grid`, messageType, selectedRow);
        this.selectedItem = selectedRow;
        if (messageType === TableCellMessageType.View) {
            this.editSelectedItem(selectedRow.ref);
        }
        else if (messageType === TableCellMessageType.Remove) {
            this.confirmRemoveSelectedItem(selectedRow.ref);
        }
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
                headerName: 'Application Term Name',
                field: 'ref.name',
                cellRendererFramework: TableCellAppTermNavComponent
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

