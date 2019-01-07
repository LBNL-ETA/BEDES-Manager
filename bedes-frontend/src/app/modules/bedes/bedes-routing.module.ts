import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BedesTermSearchComponent } from './components/bedes-term-search/bedes-term-search.component';
import { BedesTermDetailsComponent } from './components/bedes-term-details/bedes-term-details.component';
import { BedesTermResolverService } from './services/bedes-term-resolver/bedes-term-resolver.service';
import { TermBuilderHomeComponent } from './components/term-builder-home/term-builder-home.component';
import { TermBuilderEditComponent } from './components/term-builder-home/term-builder-edit/term-builder-edit.component';
import { ListManagementComponent } from './components/list-management/list-management.component';
import { ManageUnitListComponent } from './components/list-management/manage-unit-list/manage-unit-list.component';
import { ManageDataTypeListComponent } from './components/list-management/manage-data-type-list/manage-data-type-list.component';
import { ManageDefinitionSourceListComponent } from './components/list-management/manage-definition-source-list/manage-definition-source-list.component';
import { BedesTermDetailsListOptionsComponent } from './components/bedes-term-details/bedes-term-details-list-options/bedes-term-details-list-options.component';
import { EditTermListOptionComponent } from './components/bedes-term-details/bedes-term-details-list-options/edit-term-list-option/edit-term-list-option.component';
import { NewTermListOptionComponent } from './components/bedes-term-details/bedes-term-details-list-options/new-term-list-option/new-term-list-option.component';
import { CompositeTermComponent } from './components/composite-term/composite-term.component';
import { SelectTermsComponent } from './components/composite-term/select-terms/select-terms.component';
import { CompositeTermEditComponent } from './components/composite-term/composite-term-edit/composite-term-edit.component';
import { ApplicationListComponent } from './components/application-home/application-list/application-list.component';
import { ApplicationNewComponent } from './components/application-home/application-new/application-new.component';
import { ApplicationEditComponent } from './components/application-home/application-edit/application-edit.component';
import { ApplicationResolverService } from './services/application/application-resolver.service';
import { ApplicationHomeComponent } from './components/application-home/application-home.component';

const appRoutes: Routes = [
    { path: 'search', component: BedesTermSearchComponent},
    {
        path: 'bedes-term/:id',
        component: BedesTermDetailsComponent,
        resolve: {
            bedesTerm: BedesTermResolverService
        },
        children: [
            {
                path: '',
                component: BedesTermDetailsListOptionsComponent
            },
            {
                path: 'new',
                component: NewTermListOptionComponent
            },
            {
                path: 'edit/:listOptionId',
                component: EditTermListOptionComponent
            }

        ]
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
        path: 'applications',
        component: ApplicationHomeComponent,
        children: [
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                component: ApplicationListComponent
            },
            {
                path: 'new',
                component: ApplicationNewComponent
            },
            {
                path: 'edit/:id',
                component: ApplicationEditComponent,
                resolve: {
                    application: ApplicationResolverService
                },
            },
            // {
            //     path: 'search',
            //     component: SelectTermsComponent
            // },
            // {
            //     path: 'edit',
            //     component: CompositeTermEditComponent,
            //     pathMatch: 'full'
            // },
            // {
            //     path: 'edit/:id',
            //     component: CompositeTermComponent
            // }
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
