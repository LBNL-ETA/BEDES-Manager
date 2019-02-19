import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositeTermListComponent } from './composite-term-list.component';

describe('CompositeTermListComponent', () => {
  let component: CompositeTermListComponent;
  let fixture: ComponentFixture<CompositeTermListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompositeTermListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompositeTermListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
