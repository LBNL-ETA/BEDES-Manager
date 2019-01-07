import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositeTermComponent } from './composite-term.component';

describe('CompositeTermComponent', () => {
  let component: CompositeTermComponent;
  let fixture: ComponentFixture<CompositeTermComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompositeTermComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompositeTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
