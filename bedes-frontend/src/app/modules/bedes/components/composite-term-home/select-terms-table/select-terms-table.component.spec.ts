import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTermsTableComponent } from './select-terms-table.component';

describe('SelectTermsTableComponent', () => {
  let component: SelectTermsTableComponent;
  let fixture: ComponentFixture<SelectTermsTableComponent>;

  beforeEach(async(() => {
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
