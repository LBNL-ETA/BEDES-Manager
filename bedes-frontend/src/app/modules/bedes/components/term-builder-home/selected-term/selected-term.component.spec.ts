import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedTermComponent } from './selected-term.component';

describe('SelectedTermComponent', () => {
  let component: SelectedTermComponent;
  let fixture: ComponentFixture<SelectedTermComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedTermComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
