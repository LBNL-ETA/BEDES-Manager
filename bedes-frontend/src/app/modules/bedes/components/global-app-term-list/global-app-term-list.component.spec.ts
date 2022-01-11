import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalAppTermListComponent } from './global-app-term-list.component';

describe('GlobalAppTermListComponent', () => {
  let component: GlobalAppTermListComponent;
  let fixture: ComponentFixture<GlobalAppTermListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalAppTermListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalAppTermListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
