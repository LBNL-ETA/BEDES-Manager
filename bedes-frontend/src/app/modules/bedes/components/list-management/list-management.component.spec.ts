import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListManagementComponent } from './list-management.component';

describe('ListManagementComponent', () => {
  let component: ListManagementComponent;
  let fixture: ComponentFixture<ListManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
