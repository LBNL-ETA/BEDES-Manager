import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { API_URL_TOKEN, API_URL } from './services/api-url/api-url.service';

import { AppMaterialModule } from './modules/app-material/app-material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { BedesModule } from './modules/bedes/bedes.module';
import { BedesAuthModule } from './modules/bedes-auth/bedes-auth.module';

import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { addIcons } from './add-icons';
import { WaitingDialogComponent } from './components/waiting-dialog/waiting-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        WaitingDialogComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        BedesModule,
        AppMaterialModule,
        FontAwesomeModule,
        BedesAuthModule
    ],
    providers: [
        { provide: API_URL_TOKEN, useValue: API_URL }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(library: FaIconLibrary) {
        // Add the Fontawesome icons the app is using.
        addIcons(library);
    }
}
