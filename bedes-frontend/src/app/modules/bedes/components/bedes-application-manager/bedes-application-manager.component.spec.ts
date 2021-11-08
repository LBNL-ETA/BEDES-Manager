import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BedesApplicationManagerComponent } from './bedes-application-manager.component';

describe('BedesApplicationManagerComponent', () => {
  let component: BedesApplicationManagerComponent;
  let fixture: ComponentFixture<BedesApplicationManagerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesApplicationManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesApplicationManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
