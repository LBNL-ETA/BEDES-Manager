import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedesSearchQueryBuilderComponent } from './bedes-search-query-builder.component';

describe('BedesSearchQueryBuilderComponent', () => {
  let component: BedesSearchQueryBuilderComponent;
  let fixture: ComponentFixture<BedesSearchQueryBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesSearchQueryBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesSearchQueryBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
