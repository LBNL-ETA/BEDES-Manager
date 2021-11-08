import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TermMappingComponent } from './term-mapping.component';

describe('TermMappingComponent', () => {
  let component: TermMappingComponent;
  let fixture: ComponentFixture<TermMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TermMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
