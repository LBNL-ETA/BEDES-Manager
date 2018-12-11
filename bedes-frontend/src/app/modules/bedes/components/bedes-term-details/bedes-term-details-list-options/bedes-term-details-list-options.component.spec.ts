import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedesTermDetailsListOptionsComponent } from './bedes-term-details-list-options.component';

describe('BedesTermDetailsListOptionsComponent', () => {
  let component: BedesTermDetailsListOptionsComponent;
  let fixture: ComponentFixture<BedesTermDetailsListOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesTermDetailsListOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesTermDetailsListOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
