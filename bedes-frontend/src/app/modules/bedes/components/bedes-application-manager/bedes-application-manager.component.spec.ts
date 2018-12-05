import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedesApplicationManagerComponent } from './bedes-application-manager.component';

describe('BedesApplicationManagerComponent', () => {
  let component: BedesApplicationManagerComponent;
  let fixture: ComponentFixture<BedesApplicationManagerComponent>;

  beforeEach(async(() => {
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
