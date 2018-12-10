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

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        HttpClientModule,
        RouterModule,
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
        ConfirmDialogComponent
    ],
    entryComponents: [
        BedesTermSearchDialogComponent,
        ConfirmDialogComponent
    ],
    providers: [
        BedesTermSearchService,
        SupportListService,
        { provide: API_URL_TOKEN, useValue: API_URL },
        {
            provide: APP_INITIALIZER,
            useFactory: supportListFactory,
            deps: [SupportListService],
            multi: true
        },
        BedesTermSelectorService
    ]
})
export class BedesModule { }
