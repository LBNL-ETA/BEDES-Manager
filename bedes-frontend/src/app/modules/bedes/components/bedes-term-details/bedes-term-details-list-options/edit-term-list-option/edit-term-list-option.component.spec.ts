import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditTermListOptionComponent } from './edit-term-list-option.component';

describe('EditTermListOptionComponent', () => {
  let component: EditTermListOptionComponent;
  let fixture: ComponentFixture<EditTermListOptionComponent>;

  beforeEach(waitForAsync(() => {
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
