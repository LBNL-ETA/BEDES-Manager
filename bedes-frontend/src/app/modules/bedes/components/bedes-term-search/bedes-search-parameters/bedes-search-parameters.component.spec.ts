import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BedesSearchParametersComponent } from './bedes-search-parameters.component';

describe('BedesSearchParametersComponent', () => {
  let component: BedesSearchParametersComponent;
  let fixture: ComponentFixture<BedesSearchParametersComponent>;

  beforeEach(waitForAsync(() => {
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
