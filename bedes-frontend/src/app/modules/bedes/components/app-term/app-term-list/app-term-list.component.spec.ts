import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppTermListComponent } from './app-term-list.component';

describe('AppTermListComponent', () => {
  let component: AppTermListComponent;
  let fixture: ComponentFixture<AppTermListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppTermListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTermListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
