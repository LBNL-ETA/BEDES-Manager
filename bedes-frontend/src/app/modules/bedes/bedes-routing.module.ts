import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BedesTermSearchComponent} from './components/bedes-term-search/bedes-term-search.component';
import {BedesTermDetailsComponent} from './components/bedes-term-details/bedes-term-details.component';
import {BedesTermResolverService} from './services/bedes-term-resolver/bedes-term-resolver.service';
import {TermBuilderHomeComponent} from './components/composite-term-home/term-builder-home.component';
import {ListManagementComponent} from './components/list-management/list-management.component';
import {ManageUnitListComponent} from './components/list-management/manage-unit-list/manage-unit-list.component';
import {ManageDataTypeListComponent} from './components/list-management/manage-data-type-list/manage-data-type-list.component';
import {
    ManageDefinitionSourceListComponent
} from './components/list-management/manage-definition-source-list/manage-definition-source-list.component';
import {
    BedesTermDetailsListOptionsComponent
} from './components/bedes-term-details/bedes-term-details-list-options/bedes-term-details-list-options.component';
import {
    EditTermListOptionComponent
} from './components/bedes-term-details/bedes-term-details-list-options/edit-term-list-option/edit-term-list-option.component';
import {
    NewTermListOptionComponent
} from './components/bedes-term-details/bedes-term-details-list-options/new-term-list-option/new-term-list-option.component';
import {ApplicationListComponent} from './components/application-list/application-list.component';
import {ApplicationNewComponent} from './components/application-home/application-new/application-new.component';
import {ApplicationEditComponent} from './components/application-home/application-edit/application-edit.component';
import {ApplicationResolverService} from './services/application/application-resolver.service';
import {ApplicationHomeComponent} from './components/application-home/application-home.component';
import {AppTermListComponent} from './components/app-term/app-term-list/app-term-list.component';
import {CompositeTermListComponent} from './components/composite-term-home/composite-term-list/composite-term-list.component';
import {CompositeTermResolverService} from './services/composite-term/composite-term-resolver.service';
import {AppTermListResolverService} from './services/app-term-list/app-term-list-resolver.service';
import {AppTermResolverService} from './services/app-term/app-term-resolver.service';
import {AuthGuardService} from '../bedes-auth/services/auth-guard/auth-guard.service';
import {ApplicationListResolverService} from './services/application/application-list-resolver.service';
import {ImplementationTermComponent} from './components/app-term/app-term-edit/implementation-term/implementation-term.component';
import {GlobalAppTermListComponent} from './components/global-app-term-list/global-app-term-list.component';
import {CompositeTermEditPageComponent} from './components/composite-term-home/composite-term-edit-page/composite-term-edit-page.component';
import {
    CompositeTermForAppTermPageComponent
} from './components/app-term/app-term-edit/implementation-term/composite-term-for-app-term-page/composite-term-for-app-term-page.component';

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
        path: 'composite-term',
        component: TermBuilderHomeComponent,
        children: [
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                component: CompositeTermListComponent
            },
            {
                path: 'edit',
                component: CompositeTermEditPageComponent,
                resolve: {
                    term: CompositeTermResolverService
                }
            },
            {
                path: 'edit/:id',
                component: CompositeTermEditPageComponent,
                resolve: {
                    term: CompositeTermResolverService
                }
            }
        ]
    },
    {
        path: 'application-term',
        component: GlobalAppTermListComponent
    },
    {
        path: 'applications',
        component: ApplicationListComponent,
        resolve: {
            data: ApplicationListResolverService
        }
    },
    {
        path: 'applications/new',
        component: ApplicationNewComponent,
        canActivate: [AuthGuardService]
    },
    {
        path: 'applications/:appId',
        component: ApplicationHomeComponent,
        // canActivate: [AuthGuardService],
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
                path: 'terms/new',
                component: ImplementationTermComponent,
                resolve: {
                    appTerm: AppTermResolverService
                },
                canActivate: [AuthGuardService]
            },
            {
                path: 'terms/:termId',
                component: ImplementationTermComponent,
                resolve: {
                    appTerm: AppTermResolverService
                }
            },
            {
                path: 'terms/:termId/map-composite-term',
                component: CompositeTermForAppTermPageComponent,
                resolve: {
                    appTerm: AppTermResolverService,
                    term: CompositeTermResolverService
                }
            },
            {
                path: 'terms/:termId/map-composite-term/:id',
                component: CompositeTermForAppTermPageComponent,
                resolve: {
                    appTerm: AppTermResolverService,
                    term: CompositeTermResolverService
                }
            },
        ]
    },
    {
        path: 'list-management',
        component: ListManagementComponent,
        canActivate: [AuthGuardService],
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
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class BedesRoutingModule { }
