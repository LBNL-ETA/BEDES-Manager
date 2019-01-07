import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTermsComponent } from './select-terms.component';

describe('SelectTermsComponent', () => {
  let component: SelectTermsComponent;
  let fixture: ComponentFixture<SelectTermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
