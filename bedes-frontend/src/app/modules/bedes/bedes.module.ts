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
    ],
    declarations: [
        BedesTermSearchComponent,
        BedesSearchResultsTableComponent,
        BedesSearchParametersComponent,
        DataTypePipe,
        BedesUnitPipe,
        BedesTermCategoryPipe,
        BedesTermDetailsComponent
    ],
    entryComponents: [],
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
    ]
})
export class BedesModule { }
