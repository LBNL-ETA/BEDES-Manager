import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MappingViewComponent } from './mapping-view.component';

describe('MappingViewComponent', () => {
  let component: MappingViewComponent;
  let fixture: ComponentFixture<MappingViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
