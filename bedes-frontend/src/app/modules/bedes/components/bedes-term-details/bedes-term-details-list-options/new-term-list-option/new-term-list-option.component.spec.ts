import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTermListOptionComponent } from './new-term-list-option.component';

describe('NewTermListOptionComponent', () => {
  let component: NewTermListOptionComponent;
  let fixture: ComponentFixture<NewTermListOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTermListOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTermListOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
