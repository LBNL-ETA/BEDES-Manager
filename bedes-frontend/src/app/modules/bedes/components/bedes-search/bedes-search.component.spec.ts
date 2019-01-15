import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedesSearchComponent } from './bedes-search.component';

describe('BedesSearchComponent', () => {
  let component: BedesSearchComponent;
  let fixture: ComponentFixture<BedesSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
