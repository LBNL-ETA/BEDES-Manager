import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositeTermEditComponent } from './composite-term-edit.component';

describe('CompositeTermEditComponent', () => {
  let component: CompositeTermEditComponent;
  let fixture: ComponentFixture<CompositeTermEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompositeTermEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompositeTermEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
