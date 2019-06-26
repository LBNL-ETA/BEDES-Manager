import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellDeleteComponent } from './table-cell-delete.component';

describe('TableCellDeleteComponent', () => {
  let component: TableCellDeleteComponent;
  let fixture: ComponentFixture<TableCellDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
