import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewListOptionDialogComponent } from './new-list-option-dialog.component';

describe('NewListOptionDialogComponent', () => {
  let component: NewListOptionDialogComponent;
  let fixture: ComponentFixture<NewListOptionDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewListOptionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewListOptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
