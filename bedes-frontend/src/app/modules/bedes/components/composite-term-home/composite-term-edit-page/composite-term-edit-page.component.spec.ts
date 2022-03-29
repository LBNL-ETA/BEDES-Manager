import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositeTermEditPageComponent } from './composite-term-edit-page.component';

describe('CompositeTermEditPageComponent', () => {
  let component: CompositeTermEditPageComponent;
  let fixture: ComponentFixture<CompositeTermEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompositeTermEditPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompositeTermEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
