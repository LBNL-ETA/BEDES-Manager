import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedesSearchResultsTableComponent } from './bedes-search-results-table.component';

describe('BedesSearchResultsTableComponent', () => {
  let component: BedesSearchResultsTableComponent;
  let fixture: ComponentFixture<BedesSearchResultsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesSearchResultsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesSearchResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
