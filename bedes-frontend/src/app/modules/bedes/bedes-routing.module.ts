import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BedesTermSearchComponent } from './components/bedes-term-search/bedes-term-search.component';
import { BedesTermDetailsComponent } from './components/bedes-term-details/bedes-term-details.component';
import { BedesTermResolverServiceService } from './services/bedes-term-resolver-service/bedes-term-resolver-service.service';
import { TermBuilderHomeComponent } from './components/term-builder-home/term-builder-home.component';
import { TermBuilderEditComponent } from './components/term-builder-home/term-builder-edit/term-builder-edit.component';
import { ListManagementComponent } from './components/list-management/list-management.component';
import { ManageUnitListComponent } from './components/list-management/manage-unit-list/manage-unit-list.component';
import { ManageDataTypeListComponent } from './components/list-management/manage-data-type-list/manage-data-type-list.component';
import { ManageDefinitionSourceListComponent } from './components/list-management/manage-definition-source-list/manage-definition-source-list.component';
import { BedesTermDetailsListOptionsComponent } from './components/bedes-term-details/bedes-term-details-list-options/bedes-term-details-list-options.component';

const appRoutes: Routes = [
    { path: 'search', component: BedesTermSearchComponent},
    {
        path: 'bedes-term/:id',
        component: BedesTermDetailsComponent,
        resolve: {
            bedesTerm: BedesTermResolverServiceService
        }
    },
    {
        path: 'term-builder',
        component: TermBuilderHomeComponent,
        children: [{
                path: '',
                redirectTo: 'build',
                pathMatch: 'full'
            },
            {
                path: 'build',
                component: TermBuilderEditComponent
            }
        ]
    },
    {
        path: 'list-management',
        component: ListManagementComponent,
        children: [{
            path: 'unit',
            component: ManageUnitListComponent
        },{
            path: 'data-type',
            component: ManageDataTypeListComponent
        }, {
            path: 'definition-source',
            component: ManageDefinitionSourceListComponent
        }]
    },
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    // { path: '**', redirectTo: '/search' }
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    declarations: [],
    exports: [
        RouterModule
    ]
})
export class BedesRoutingModule { }
