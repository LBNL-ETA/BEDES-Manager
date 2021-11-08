import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationHomeComponent } from './application-home.component';

describe('ApplicationHomeComponent', () => {
  let component: ApplicationHomeComponent;
  let fixture: ComponentFixture<ApplicationHomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
