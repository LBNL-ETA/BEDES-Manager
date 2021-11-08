import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectedTermsOrderComponent } from './selected-terms-order.component';

describe('SelectedTermsOrderComponent', () => {
  let component: SelectedTermsOrderComponent;
  let fixture: ComponentFixture<SelectedTermsOrderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedTermsOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedTermsOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
