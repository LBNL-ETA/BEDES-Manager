import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImplementationTermComponent } from './implementation-term.component';

describe('ImplementationTermComponent', () => {
  let component: ImplementationTermComponent;
  let fixture: ComponentFixture<ImplementationTermComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImplementationTermComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImplementationTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
