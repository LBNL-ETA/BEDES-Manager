import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginHomeComponent } from './components/login-home/login-home.component';
import { LoginComponent } from './components/login-home/login/login.component';
import { RequestAccountComponent } from './components/login-home/request-account/request-account.component';
import { VerificationComponent } from './components/login-home/verification/verification.component';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';

const appRoutes: Routes = [
    {
        path: 'login',
        component: LoginHomeComponent,
        children: [{
            path: '',
            component: LoginComponent
        }, {
            path: 'request-account',
            component: RequestAccountComponent
        }, {
            path: 'verify',
            component: VerificationComponent,
            canActivate: [AuthGuardService]
        }]
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
export class AuthRoutingModule { }
