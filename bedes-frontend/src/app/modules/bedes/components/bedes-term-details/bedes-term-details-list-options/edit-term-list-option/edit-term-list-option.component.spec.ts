import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTermListOptionComponent } from './edit-term-list-option.component';

describe('EditTermListOptionComponent', () => {
  let component: EditTermListOptionComponent;
  let fixture: ComponentFixture<EditTermListOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTermListOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTermListOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
