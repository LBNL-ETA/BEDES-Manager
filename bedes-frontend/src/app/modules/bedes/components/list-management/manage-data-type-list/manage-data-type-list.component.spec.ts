import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageDataTypeListComponent } from './manage-data-type-list.component';

describe('ManageDataTypeListComponent', () => {
  let component: ManageDataTypeListComponent;
  let fixture: ComponentFixture<ManageDataTypeListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageDataTypeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDataTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
