import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppTermEditComponent } from './app-term-edit.component';

describe('AppTermEditComponent', () => {
  let component: AppTermEditComponent;
  let fixture: ComponentFixture<AppTermEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppTermEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTermEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
