import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TermBuilderEditComponent } from './term-builder-edit.component';

describe('TermBuilderEditComponent', () => {
  let component: TermBuilderEditComponent;
  let fixture: ComponentFixture<TermBuilderEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TermBuilderEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermBuilderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
