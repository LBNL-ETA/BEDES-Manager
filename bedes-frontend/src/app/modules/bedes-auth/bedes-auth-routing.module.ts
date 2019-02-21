import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login-home/login/login.component';
import { VerifyComponent } from './components/login-home/verify/verify.component';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';
import { LoginHomeComponent } from './components/login-home/login-home.component';
import { LogoutComponent } from './components/login-home/logout/logout.component';
import { RequestAccountComponent } from './components/login-home/request-account/request-account.component';
import { PasswordChangeComponent } from './components/login-home/password-change/password-change.component';

const appRoutes: Routes = [
    // { path: 'login', component: LoginComponent }
    {
        path: 'home',
        component: LoginHomeComponent,
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'verify/:verificationCode',
                component: VerifyComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'verify',
                component: VerifyComponent,
                canActivate: [AuthGuardService]
            },
            {
                path: 'request-account',
                component: RequestAccountComponent
            },
            {
                path: 'password-update',
                component: PasswordChangeComponent
            },
            {
                path: 'logout',
                component: LogoutComponent,
                canActivate: [AuthGuardService]
            },
        ]
    }
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
export class BedesAuthRoutingModule { }
