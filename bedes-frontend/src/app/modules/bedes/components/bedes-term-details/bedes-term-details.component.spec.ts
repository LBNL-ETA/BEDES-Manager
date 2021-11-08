import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BedesTermDetailsComponent } from './bedes-term-details.component';

describe('BedesTermDetailsComponent', () => {
  let component: BedesTermDetailsComponent;
  let fixture: ComponentFixture<BedesTermDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesTermDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesTermDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
