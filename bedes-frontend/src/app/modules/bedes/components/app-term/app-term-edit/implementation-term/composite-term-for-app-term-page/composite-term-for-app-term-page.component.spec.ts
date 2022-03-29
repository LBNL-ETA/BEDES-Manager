import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositeTermForAppTermPageComponent } from './composite-term-for-app-term-page.component';

describe('CompositeTermForAppTermPageComponent', () => {
  let component: CompositeTermForAppTermPageComponent;
  let fixture: ComponentFixture<CompositeTermForAppTermPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompositeTermForAppTermPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompositeTermForAppTermPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
