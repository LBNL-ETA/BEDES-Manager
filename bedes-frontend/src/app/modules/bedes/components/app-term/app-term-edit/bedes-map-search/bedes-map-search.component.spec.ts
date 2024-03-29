import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BedesMapSearchComponent } from './bedes-map-search.component';

describe('BedesMapSearchComponent', () => {
  let component: BedesMapSearchComponent;
  let fixture: ComponentFixture<BedesMapSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesMapSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesMapSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
