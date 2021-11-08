import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReplaceUnitComponent } from './replace-unit.component';

describe('ReplaceUnitComponent', () => {
  let component: ReplaceUnitComponent;
  let fixture: ComponentFixture<ReplaceUnitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceUnitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
