import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditListOptionComponent } from './edit-list-option.component';

describe('EditListOptionComponent', () => {
  let component: EditListOptionComponent;
  let fixture: ComponentFixture<EditListOptionComponent>;

  beforeEach(waitForAsync(() => {
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
