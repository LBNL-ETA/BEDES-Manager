import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {BedesTermSearchDialogComponent} from '../bedes-term-search-dialog/bedes-term-search-dialog.component';

describe('BedesTermSearchDialogComponent', () => {
  let component: BedesTermSearchDialogComponent;
  let fixture: ComponentFixture<BedesTermSearchDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BedesTermSearchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedesTermSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
