import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationNewComponent } from './application-new.component';

describe('ApplicationNewComponent', () => {
  let component: ApplicationNewComponent;
  let fixture: ComponentFixture<ApplicationNewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
