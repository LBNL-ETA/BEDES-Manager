import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BedesTermSearchComponent } from './bedes-term-search.component';

describe('BedesTermSearchComponent', () => {
  let component: BedesTermSearchComponent;
  let fixture: ComponentFixture<BedesTermSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesTermSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesTermSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
