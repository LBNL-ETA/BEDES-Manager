import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TableCellBedesUnitComponent } from './table-cell-bedes-unit.component';

describe('TableCellBedesUnitComponent', () => {
  let component: TableCellBedesUnitComponent;
  let fixture: ComponentFixture<TableCellBedesUnitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellBedesUnitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellBedesUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
