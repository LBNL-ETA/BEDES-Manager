import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageUnitListComponent } from './manage-unit-list.component';

describe('ManageUnitListComponent', () => {
  let component: ManageUnitListComponent;
  let fixture: ComponentFixture<ManageUnitListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageUnitListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUnitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
