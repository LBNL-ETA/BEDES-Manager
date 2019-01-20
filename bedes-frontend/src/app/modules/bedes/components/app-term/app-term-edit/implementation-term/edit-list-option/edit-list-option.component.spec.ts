import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditListOptionComponent } from './edit-list-option.component';

describe('EditListOptionComponent', () => {
  let component: EditListOptionComponent;
  let fixture: ComponentFixture<EditListOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditListOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditListOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
