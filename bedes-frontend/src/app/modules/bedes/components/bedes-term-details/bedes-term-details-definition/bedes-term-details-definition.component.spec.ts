import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BedesTermDetailsDefinitionComponent } from './bedes-term-details-definition.component';

describe('BedesTermDetailsDefinitionComponent', () => {
  let component: BedesTermDetailsDefinitionComponent;
  let fixture: ComponentFixture<BedesTermDetailsDefinitionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesTermDetailsDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesTermDetailsDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
