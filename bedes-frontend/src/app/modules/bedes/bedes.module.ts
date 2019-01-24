import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppMaterialModule } from 'src/app/modules/app-material/app-material.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { API_URL_TOKEN, API_URL } from './services/url/url.service';
import { BedesTermSearchComponent } from './components/bedes-term-search/bedes-term-search.component';
import { BedesTermSearchService } from './services/bedes-term-search/bedes-term-search.service';
import { BedesRoutingModule } from './bedes-routing.module';
import { BedesSearchResultsTableComponent } from './components/bedes-term-search/bedes-search-results-table/bedes-search-results-table.component';
import { SupportListService } from './services/support-list/support-list.service';
import { supportListFactory } from './services/support-list/support-list-factory.service';
import { BedesSearchParametersComponent } from './components/bedes-term-search/bedes-search-parameters/bedes-search-parameters.component';
import { DataTypePipe } from './pipes/data-type/data-type.pipe';
import { BedesUnitPipe } from './pipes/bedes-unit/bedes-unit.pipe';
import { BedesTermCategoryPipe } from './pipes/bedes-term-category/bedes-term-category.pipe';
import { BedesTermDetailsComponent } from './components/bedes-term-details/bedes-term-details.component';
import { TermBuilderHomeComponent } from './components/term-builder-home/term-builder-home.component';
import { BedesApplicationManagerComponent } from './components/bedes-application-manager/bedes-application-manager.component';
import { BedesTermSearchDialogComponent } from './components/dialogs/bedes-term-search-dialog/bedes-term-search-dialog.component';
import { TermBuilderEditComponent } from './components/term-builder-home/term-builder-edit/term-builder-edit.component';
import { SelectedTermComponent } from './components/term-builder-home/selected-term-container/selected-term/selected-term.component';
import { SelectTermsTableComponent } from './components/term-builder-home/select-terms-table/select-terms-table.component';
import { SelectedTermsTableComponent } from './components/term-builder-home/selected-terms-table/selected-terms-table.component';
import { SelectedTermContainerComponent } from './components/term-builder-home/selected-term-container/selected-term-container.component';
import { AgGridModule } from 'ag-grid-angular';
import { BedesTermSelectorService } from './services/bedes-term-selector/bedes-term-selector.service';
import { ConfirmDialogComponent } from './components/dialogs/confirm-dialog/confirm-dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BedesTermDetailsDefinitionComponent } from './components/bedes-term-details/bedes-term-details-definition/bedes-term-details-definition.component';
import { BedesTermDetailsListOptionsComponent } from './components/bedes-term-details/bedes-term-details-list-options/bedes-term-details-list-options.component';
import { ListManagementComponent } from './components/list-management/list-management.component';
import { ManageUnitListComponent } from './components/list-management/manage-unit-list/manage-unit-list.component';
import { ManageDefinitionSourceListComponent } from './components/list-management/manage-definition-source-list/manage-definition-source-list.component';
import { ManageCategoryListComponent } from './components/list-management/manage-category-list/manage-category-list.component';
import { ManageDataTypeListComponent } from './components/list-management/manage-data-type-list/manage-data-type-list.component';
import { BedesUnitService } from './services/bedes-unit/bedes-unit.service';
import { ReplaceUnitComponent } from './components/list-management/manage-unit-list/replace-unit/replace-unit.component';
import { NewUnitComponent } from './components/list-management/manage-unit-list/new-unit/new-unit.component';
import { EditUnitComponent } from './components/list-management/manage-unit-list/edit-unit/edit-unit.component';
import { NewTermListOptionComponent } from './components/bedes-term-details/bedes-term-details-list-options/new-term-list-option/new-term-list-option.component';
import { EditTermListOptionComponent } from './components/bedes-term-details/bedes-term-details-list-options/edit-term-list-option/edit-term-list-option.component';
import { BedesTermListOptionService } from './services/bedes-term-list-option/bedes-term-list-option.service';
import { TableCellBedesCategoryComponent } from './components/bedes-term-search/bedes-search-results-table/table-cell-bedes-category/table-cell-bedes-category.component';
import { TableCellBedesUnitComponent } from './components/bedes-term-search/bedes-search-results-table/table-cell-bedes-unit/table-cell-bedes-unit.component';
import { TableCellBedesDataTypeComponent } from './components/bedes-term-search/bedes-search-results-table/table-cell-bedes-data-type/table-cell-bedes-data-type.component';
import { TableCellTermNameComponent } from './components/bedes-term-search/bedes-search-results-table/table-cell-term-name/table-cell-term-name.component';
import { CompositeTermComponent } from './components/composite-term/composite-term.component';
import { SelectTermsComponent } from './components/composite-term/select-terms/select-terms.component';
import { CompositeTermEditComponent } from './components/composite-term/composite-term-edit/composite-term-edit.component';
import { ApplicationListComponent } from './components/application-home/application-list/application-list.component';
import { ApplicationNewComponent } from './components/application-home/application-new/application-new.component';
import { ApplicationEditComponent } from './components/application-home/application-edit/application-edit.component';
import { applicationListFactory } from './services/application/application-list-factory.service';
import { ApplicationService } from './services/application/application.service';
import { ApplicationHomeComponent } from './components/application-home/application-home.component';
import { ApplicationResolverService } from './services/application/application-resolver.service';
import { TableCellNameNavComponent } from './components/application-home/application-list/table-cell-name-nav/table-cell-name-nav.component';
import { AppTermListComponent } from './components/app-term/app-term-list/app-term-list.component';
import { AppTermEditComponent } from './components/app-term/app-term-edit/app-term-edit.component';
import { TermMappingComponent } from './components/app-term/app-term-edit/term-mapping/term-mapping.component';
import { ImplementationTermComponent } from './components/app-term/app-term-edit/implementation-term/implementation-term.component';
import { BedesSearchComponent } from './components/bedes-search/bedes-search.component';
import { BedesSearchQueryBuilderComponent } from './components/bedes-search/bedes-search-query-builder/bedes-search-query-builder.component';
import { BedesSearchResultsComponent } from './components/bedes-search/bedes-search-results/bedes-search-results.component';
import { ImplementationTermOptionComponent } from './components/app-term/app-term-edit/implementation-term/implementation-term-option/implementation-term-option.component';
import { EditListOptionComponent } from './components/app-term/app-term-edit/implementation-term/edit-list-option/edit-list-option.component';
import { DisplayListOptionsComponent } from './components/app-term/app-term-edit/implementation-term/display-list-options/display-list-options.component';
import { CompositeTermListComponent } from './components/term-builder-home/composite-term-list/composite-term-list.component';
import { compositeTermFactory } from './services/composite-term/composite-term-factory.service';
import { CompositeTermService } from './services/composite-term/composite-term.service';
import { SelectedTermsOrderComponent } from './components/term-builder-home/selected-terms-order/selected-terms-order.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        HttpClientModule,
        RouterModule,
        DragDropModule,
        AppMaterialModule,
        FontAwesomeModule,
        BedesRoutingModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        BedesTermSearchComponent,
        BedesSearchResultsTableComponent,
        BedesSearchParametersComponent,
        DataTypePipe,
        BedesUnitPipe,
        BedesTermCategoryPipe,
        BedesTermDetailsComponent,
        TermBuilderHomeComponent,
        BedesApplicationManagerComponent,
        BedesTermSearchDialogComponent,
        TermBuilderEditComponent,
        SelectedTermComponent,
        SelectTermsTableComponent,
        SelectedTermsTableComponent,
        SelectedTermContainerComponent,
        ConfirmDialogComponent,
        BedesTermDetailsDefinitionComponent,
        BedesTermDetailsListOptionsComponent,
        ListManagementComponent,
        ManageUnitListComponent,
        ManageDefinitionSourceListComponent,
        ManageCategoryListComponent,
        ManageDataTypeListComponent,
        ReplaceUnitComponent,
        NewUnitComponent,
        EditUnitComponent,
        NewTermListOptionComponent,
        EditTermListOptionComponent,
        TableCellBedesCategoryComponent,
        TableCellBedesUnitComponent,
        TableCellBedesDataTypeComponent,
        TableCellTermNameComponent,
        CompositeTermComponent,
        SelectTermsComponent,
        CompositeTermEditComponent,
        ApplicationListComponent,
        ApplicationNewComponent,
        ApplicationEditComponent,
        ApplicationHomeComponent,
        TableCellNameNavComponent,
        AppTermListComponent,
        AppTermEditComponent,
        TermMappingComponent,
        ImplementationTermComponent,
        BedesSearchComponent,
        BedesSearchQueryBuilderComponent,
        BedesSearchResultsComponent,
        ImplementationTermOptionComponent,
        EditListOptionComponent,
        DisplayListOptionsComponent,
        CompositeTermListComponent,
        SelectedTermsOrderComponent,
    ],
    entryComponents: [
        BedesTermSearchDialogComponent,
        ConfirmDialogComponent,
        TableCellBedesCategoryComponent,
        TableCellTermNameComponent,
        TableCellNameNavComponent
    ],
    providers: [
        BedesTermSearchService,
        SupportListService,
        BedesUnitService,
        { provide: API_URL_TOKEN, useValue: API_URL },
        {
            provide: APP_INITIALIZER,
            useFactory: supportListFactory,
            deps: [SupportListService],
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: applicationListFactory,
            deps: [ApplicationService],
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: compositeTermFactory,
            deps: [CompositeTermService],
            multi: true
        },
        BedesTermSelectorService,
        BedesTermListOptionService,
        ApplicationService,
        CompositeTermService
    ]
})
export class BedesModule { }
