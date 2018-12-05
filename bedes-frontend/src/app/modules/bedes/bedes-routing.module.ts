import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BedesTermSearchComponent } from './components/bedes-term-search/bedes-term-search.component';
import { BedesTermDetailsComponent } from './components/bedes-term-details/bedes-term-details.component';
import { BedesTermResolverServiceService } from './services/bedes-term-resolver-service/bedes-term-resolver-service.service';
import { TermBuilderHomeComponent } from './components/term-builder-home/term-builder-home.component';
import { TermBuilderEditComponent } from './components/term-builder-home/term-builder-edit/term-builder-edit.component';

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
