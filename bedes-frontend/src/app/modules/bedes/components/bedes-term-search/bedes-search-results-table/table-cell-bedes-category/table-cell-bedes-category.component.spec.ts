import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellBedesCategoryComponent } from './table-cell-bedes-category.component';

describe('TableCellBedesCategoryComponent', () => {
  let component: TableCellBedesCategoryComponent;
  let fixture: ComponentFixture<TableCellBedesCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableCellBedesCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellBedesCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
