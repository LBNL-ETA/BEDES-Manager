import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedesSearchParametersComponent } from './bedes-search-parameters.component';

describe('BedesSearchParametersComponent', () => {
  let component: BedesSearchParametersComponent;
  let fixture: ComponentFixture<BedesSearchParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesSearchParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesSearchParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
