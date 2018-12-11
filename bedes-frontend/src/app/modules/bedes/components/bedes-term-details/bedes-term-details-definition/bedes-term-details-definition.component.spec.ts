import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedesTermDetailsDefinitionComponent } from './bedes-term-details-definition.component';

describe('BedesTermDetailsDefinitionComponent', () => {
  let component: BedesTermDetailsDefinitionComponent;
  let fixture: ComponentFixture<BedesTermDetailsDefinitionComponent>;

  beforeEach(async(() => {
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
