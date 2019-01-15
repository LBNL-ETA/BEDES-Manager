import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTermHomeComponent } from './app-term-home.component';

describe('AppTermHomeComponent', () => {
  let component: AppTermHomeComponent;
  let fixture: ComponentFixture<AppTermHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppTermHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTermHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
