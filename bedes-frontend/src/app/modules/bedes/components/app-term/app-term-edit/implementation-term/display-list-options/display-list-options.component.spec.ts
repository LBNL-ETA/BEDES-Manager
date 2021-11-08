import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DisplayListOptionsComponent } from './display-list-options.component';

describe('DisplayListOptionsComponent', () => {
  let component: DisplayListOptionsComponent;
  let fixture: ComponentFixture<DisplayListOptionsComponent>;

  beforeEach(waitForAsync(() => {
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
