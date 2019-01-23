import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IsLoggedInComponent } from './is-logged-in.component';

describe('IsLoggedInComponent', () => {
  let component: IsLoggedInComponent;
  let fixture: ComponentFixture<IsLoggedInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IsLoggedInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IsLoggedInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
