import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDefinitionSourceListComponent } from './manage-definition-source-list.component';

describe('ManageDefinitionSourceListComponent', () => {
  let component: ManageDefinitionSourceListComponent;
  let fixture: ComponentFixture<ManageDefinitionSourceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageDefinitionSourceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDefinitionSourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
