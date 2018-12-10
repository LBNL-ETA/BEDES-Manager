import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedTermContainerComponent } from './selected-term-container.component';

describe('SelectedTermContainerComponent', () => {
  let component: SelectedTermContainerComponent;
  let fixture: ComponentFixture<SelectedTermContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedTermContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedTermContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
