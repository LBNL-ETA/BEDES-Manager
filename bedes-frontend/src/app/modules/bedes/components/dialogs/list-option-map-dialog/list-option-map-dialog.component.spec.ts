import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedesTermSearchDialogComponent } from './list-option-map-dialog.component';

describe('BedesTermSearchDialogComponent', () => {
  let component: BedesTermSearchDialogComponent;
  let fixture: ComponentFixture<BedesTermSearchDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesTermSearchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesTermSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
