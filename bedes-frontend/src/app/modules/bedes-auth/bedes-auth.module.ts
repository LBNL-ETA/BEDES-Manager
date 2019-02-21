import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppMaterialModule } from 'src/app/modules/app-material/app-material.module';

import { AuthService } from './services/auth/auth.service';
import { LoginComponent } from './components/login-home/login/login.component';

import { BedesAuthRoutingModule } from './bedes-auth-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { LoginHomeComponent } from './components/login-home/login-home.component';
import { VerifyComponent } from './components/login-home/verify/verify.component';
import { authLoggedInFactory } from './services/auth/auth-factory.service';
import { VerificationService } from './services/verification/verification.service';
import { LogoutComponent } from './components/login-home/logout/logout.component';
import { RequestAccountComponent } from './components/login-home/request-account/request-account.component';
import { InterceptorService } from './services/interceptor/interceptor.service';
import { PasswordChangeComponent } from './components/login-home/password-change/password-change.component';

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        HttpClientModule,
        AppMaterialModule,
        BedesAuthRoutingModule ,
        FontAwesomeModule,
        ReactiveFormsModule,
    ],
    declarations: [
        LoginComponent,
        LoginHomeComponent,
        VerifyComponent,
        LogoutComponent,
        RequestAccountComponent,
        PasswordChangeComponent,
    ],
    providers: [
        AuthService,
        AuthGuardService,
        VerificationService,
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
