import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayListOptionsComponent } from './display-list-options.component';

describe('DisplayListOptionsComponent', () => {
  let component: DisplayListOptionsComponent;
  let fixture: ComponentFixture<DisplayListOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayListOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayListOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
