import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AppMaterialModule } from 'src/app/app-material/app-material.module';

import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserLogin } from 'src/app/models/auth/user-login';
import { UserLoginResponse } from '../../models/auth/user-login-response';
import { Browser } from 'protractor';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async(() => {
        // create the auth service spy object
        const spy = jasmine.createSpyObj('AuthService', ['login']);
        spy.login.and.returnValue(of(<UserLoginResponse>{status: 1}));
        // create the router spy object
        const routeSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

        TestBed.configureTestingModule({
            declarations: [
               LoginComponent 
            ],
            imports: [
                FormsModule,
                BrowserAnimationsModule,
                AppMaterialModule
            ],
            providers: [
                {provide: AuthService, useValue: spy},
                {provide: Router, useValue: routeSpy}
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        authServiceSpy = TestBed.get(AuthService);
        routerSpy = TestBed.get(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        const el = fixture.nativeElement;
        expect(component).toBeTruthy();
    });

    it('should call login() when login button clicked.', () => {
        const el = fixture.nativeElement;
        const btn = el.querySelector('button#loginBtn');
        console.log(btn.disabled);
        btn.click();
        expect(authServiceSpy.login).toHaveBeenCalled();
    });

    it('should display a success message on successfull login', fakeAsync(() => {
        const el = fixture.nativeElement;
        const btn = el.querySelector('button#loginBtn');
        component.userLogin.email = "mspears@lbl.gov";
        component.userLogin.password = "abcd";
        btn.click();
        // console.log(authServiceSpy.calls.first().args);
        expect(component.loginSuccess).toBeTruthy();
        fixture.detectChanges();
        tick(1000);
        fixture.detectChanges();
        const container = el.querySelector('div#loginSuccessMessage');
    }));

    it('should route to the home page on successfull login', fakeAsync(() => {
        const el = fixture.nativeElement;
        const btn = el.querySelector('button#loginBtn');
        component.userLogin.email = "mspears@lbl.gov";
        component.userLogin.password = "abcd";
        btn.click();
        // console.log(authServiceSpy.calls.first().args);
        expect(component.loginSuccess).toBeTruthy();
        fixture.detectChanges();
        tick(1000);
        fixture.detectChanges();
        expect(routerSpy.navigateByUrl).toHaveBeenCalled();
    }));
});
