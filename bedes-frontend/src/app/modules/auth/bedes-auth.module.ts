import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppMaterialModule } from 'src/app/modules/app-material/app-material.module';

import { AuthService } from './services/auth/auth.service';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { authLoggedInFactory } from './services/auth/auth-factory.service';
import { LoginComponent } from './components/login-home/login/login.component';

import { AuthRoutingModule } from './auth-routing.module';
import { RequestAccountComponent } from './components/login-home/request-account/request-account.component';
import { LoginHomeComponent } from './components/login-home/login-home.component';
import { VerificationComponent } from './components/login-home/verification/verification.component';
import { InterceptorService } from './services/interceptor/interceptor.service';
import { IsLoggedInComponent } from './components/login-home/is-logged-in/is-logged-in.component';
import { NotLoggedInComponent } from './components/login-home/not-logged-in/not-logged-in.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        HttpClientModule,
        AppMaterialModule,
        AuthRoutingModule,
        FontAwesomeModule
    ],
    declarations: [
        LoginComponent,
        RequestAccountComponent,
        LoginHomeComponent,
        VerificationComponent,
        IsLoggedInComponent,
        NotLoggedInComponent
    ],
    providers: [
        AuthService,
        AuthGuardService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorService,
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: authLoggedInFactory,
            deps: [AuthService],
            multi: true
        },
    ]
})
export class BedesAuthModule { }
