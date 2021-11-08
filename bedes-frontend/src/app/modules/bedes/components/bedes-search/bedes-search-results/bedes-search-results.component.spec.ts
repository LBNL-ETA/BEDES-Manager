import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BedesSearchResultsComponent } from './bedes-search-results.component';

describe('BedesSearchResultsComponent', () => {
  let component: BedesSearchResultsComponent;
  let fixture: ComponentFixture<BedesSearchResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesSearchResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
