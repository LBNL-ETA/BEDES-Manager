import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TermBuilderHomeComponent } from './term-builder-home.component';

describe('TermBuilderComponent', () => {
  let component: TermBuilderHomeComponent;
  let fixture: ComponentFixture<TermBuilderHomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TermBuilderHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermBuilderHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
