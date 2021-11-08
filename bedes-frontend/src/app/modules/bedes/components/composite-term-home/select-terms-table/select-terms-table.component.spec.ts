import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectTermsTableComponent } from './select-terms-table.component';

describe('SelectTermsTableComponent', () => {
  let component: SelectTermsTableComponent;
  let fixture: ComponentFixture<SelectTermsTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTermsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTermsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
