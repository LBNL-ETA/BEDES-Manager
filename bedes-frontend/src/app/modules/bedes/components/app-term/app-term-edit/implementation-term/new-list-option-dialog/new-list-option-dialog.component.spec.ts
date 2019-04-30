import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewListOptionDialogComponent } from './new-list-option-dialog.component';

describe('NewListOptionDialogComponent', () => {
  let component: NewListOptionDialogComponent;
  let fixture: ComponentFixture<NewListOptionDialogComponent>;

  beforeEach(async(() => {
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
