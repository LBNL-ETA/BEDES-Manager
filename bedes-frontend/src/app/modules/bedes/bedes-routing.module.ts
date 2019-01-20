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
import { AppTermListComponent } from './components/app-term/app-term-list/app-term-list.component';
import { AppTermEditComponent } from './components/app-term/app-term-edit/app-term-edit.component';
import { AppTermListResolverService } from './services/app-term-list/app-term-list-resolver.service';
import { AppTermResolverService } from './services/app-term/app-term-resolver.service';

const appRoutes: Routes = [
    { path: 'search', component: BedesTermSearchComponent },
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
        component: ApplicationListComponent,
    },
    {
        path: 'applications/new',
        component: ApplicationNewComponent
    },
    {
        path: 'applications/:appId',
        component: ApplicationHomeComponent,
        resolve: {
            application: ApplicationResolverService,
        },
        children: [
            {
                path: '',
                redirectTo: 'terms',
                pathMatch: 'full'
            },
            {
                path: 'edit',
                component: ApplicationEditComponent
            },
            {
                path: 'terms',
                component: AppTermListComponent,
                resolve: {
                    appTerms: AppTermListResolverService
                }
            },
            {
                path: 'terms/:termId',
                component: AppTermEditComponent,
                resolve: {
                    appTerms: AppTermListResolverService
                }
                // resolve: {
                //     appTerms: AppTermResolverService
                // }
            }
        ]
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
    // },
    // {
    //     path: 'app-term/:id',
    //     component: AppTermHomeComponent,
    //     resolve: {
    //         appTerms: AppTermResolverService
    //     },
    //     children: [
    //         {
    //             path: '',
    //             component: AppTermEditComponent
    //         }
    //     ]
    // },
    // {
    //     path: 'app-term/new',
    //     redirectTo: 'app-term',
    //     pathMatch: 'full'
    // },
    {
        path: 'list-management',
        component: ListManagementComponent,
        children: [{
            path: 'unit',
            component: ManageUnitListComponent
        }, {
            path: 'data-type',
            component: ManageDataTypeListComponent
        }, {
            path: 'definition-source',
            component: ManageDefinitionSourceListComponent
        }]
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
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
