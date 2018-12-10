import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedTermsTableComponent } from './selected-terms-table.component';

describe('SelectedTermsTableComponent', () => {
  let component: SelectedTermsTableComponent;
  let fixture: ComponentFixture<SelectedTermsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedTermsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedTermsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
