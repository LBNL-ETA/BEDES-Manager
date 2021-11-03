import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { BedesTerm, BedesConstrainedList } from '@bedes-common/models/bedes-term';
import { BedesTermService } from '../../../services/bedes-term/bedes-term.service';
import { SupportListService } from '../../../services/support-list/support-list.service';
import { BedesUnit } from '@bedes-common/models/bedes-unit/bedes-unit';
import { BedesDataType } from '@bedes-common/models/bedes-data-type';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions, ColDef, ValueGetterParams, SelectionChangedEvent } from 'ag-grid-community';
import { Subject, BehaviorSubject } from 'rxjs';
import { BedesTermOption } from '@bedes-common/models/bedes-term-option/bedes-term-option';
import { BedesTermListOptionService } from '../../../services/bedes-term-list-option/bedes-term-list-option.service';
import { AuthService } from 'src/app/modules/bedes-auth/services/auth/auth.service';
import { CurrentUser } from '@bedes-common/models/current-user/current-user';
import { takeUntil } from 'rxjs/operators';

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
    public selectedOption: BedesTermOption | undefined;

    private unitList: Array<BedesUnit>;
    private dataTypeList: Array<BedesDataType>;

    public isEditable: boolean;
    /* The current user */
    public currentUser: CurrentUser;

    constructor(
        private termService: BedesTermService,
        private supportListService: SupportListService,
        private listOptionService: BedesTermListOptionService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscribeToUserStatus();
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
     * Subscribe to the user status Observable to get keep the user status up to date.
     */
    private subscribeToUserStatus(): void {
        this.authService.currentUserSubject
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((currentUser: CurrentUser) => {
                this.currentUser = currentUser;
                this.isEditable = currentUser.isLoggedIn();
                this.setGridData();
            });
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
    }

    private initializeGrid(): void {
        this.gridOptions = <GridOptions>{
            enableRangeSelection: false,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            // rowSelection: 'none',
            rowDragManaged: true,
            animateRows: true,
            columnDefs: this.buildColumnDefs(),
            // getRowNodeId: (data: any) => {
            //     return data.id;
            // },
            onGridReady: () => {
                this.setGridData();
            },
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            },
            onSelectionChanged: (event: SelectionChangedEvent) => {
                const selection = event.api.getSelectedRows();
                this.selectedOption = selection.length ? selection[0] : undefined;
            }
        };
    }

    /**
     * Subscribe to the selected term BehaviorSubject.
     */
    private subscribeToSelectedTerm(): void {
        this.termService.selectedTermSubject
            .subscribe((selectedTerm: BedesTerm | BedesConstrainedList | undefined) => {
                this.term = selectedTerm;
                this.setGridData();
            });
    }

    private setGridData(): void {
        if (this.gridOptions && this.gridOptions.api && this.term) {
            if (this.term instanceof BedesConstrainedList) {
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
            {headerName: 'Name', field: 'name', checkboxSelection: false},
            {headerName: 'Description', field: 'description'},
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
     * Activate the new list option route.
     */
    public newListOption(): void {
        // change the route, but don't update the url.
        // this hides the trailing "/new" in the url
        this.router.navigate(['new'], {relativeTo: this.route, skipLocationChange: true});
    }

    /**
     * Set the flag to edit a list option.
     */
    public editListOption(): void {
        if (this.selectedOption) {
            // set the active list option
            this.listOptionService.activeListOptionSubject.next(this.selectedOption);
            // switch to the list option edit view
            const optionId = this.selectedOption.uuid ? this.selectedOption.uuid : this.selectedOption.id;
            this.router.navigate(['edit', optionId], {relativeTo: this.route});
        }
    }

    /**
     * Remove the selected list option.
     */
    public removeListOption(): void {
        if (this.selectedOption) {
            this.listOptionService.deleteListOption(this.selectedOption.id)
            .subscribe((results: any) => {
                this.selectedOption = undefined;
            }, (error: any) => {
                console.error(error);
                this.selectedOption = undefined;
            });
        }
    }

    /**
     * Determines if the "no list options" message is to be displayed,
     * ie is this a constrained list and is the array length === 0
     */
    public shouldShowListOptions(): boolean {
        if (this.term instanceof BedesConstrainedList && this.term.options && this.term.options.length) {
            return true;
        }
        else {
            return false;
        }

    }

}
