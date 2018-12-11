import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceUnitComponent } from './replace-unit.component';

describe('ReplaceUnitComponent', () => {
  let component: ReplaceUnitComponent;
  let fixture: ComponentFixture<ReplaceUnitComponent>;

  beforeEach(async(() => {
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
