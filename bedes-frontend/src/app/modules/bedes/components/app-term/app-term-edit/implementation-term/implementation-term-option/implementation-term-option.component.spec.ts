import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImplementationTermOptionComponent } from './implementation-term-option.component';

describe('ImplementationTermOptionComponent', () => {
  let component: ImplementationTermOptionComponent;
  let fixture: ComponentFixture<ImplementationTermOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImplementationTermOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImplementationTermOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
