import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TableCellTermNameComponent } from './table-cell-term-name.component';

describe('TableCellTermNameComponent', () => {
  let component: TableCellTermNameComponent;
  let fixture: ComponentFixture<TableCellTermNameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellTermNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellTermNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
