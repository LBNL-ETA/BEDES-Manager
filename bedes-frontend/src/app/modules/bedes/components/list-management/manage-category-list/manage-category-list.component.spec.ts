import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageCategoryListComponent } from './manage-category-list.component';

describe('ManageCategoryListComponent', () => {
  let component: ManageCategoryListComponent;
  let fixture: ComponentFixture<ManageCategoryListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCategoryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
