import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppMaterialModule } from 'src/app/modules/app-material/app-material.module';
import { BedesTermSearchComponent } from './components/bedes-term-search/bedes-term-search.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        HttpClientModule,
        RouterModule,
        AppMaterialModule
    ],
    declarations: [
    BedesTermSearchComponent],
    entryComponents: [],
    providers: [
    ]
})
export class BedesModule { }
