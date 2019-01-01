import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellBedesDataTypeComponent } from './table-cell-bedes-data-type.component';

describe('TableCellBedesDataTypeComponent', () => {
  let component: TableCellBedesDataTypeComponent;
  let fixture: ComponentFixture<TableCellBedesDataTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellBedesDataTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellBedesDataTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
