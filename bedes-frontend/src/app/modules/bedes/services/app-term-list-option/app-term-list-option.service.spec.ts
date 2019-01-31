import { TestBed } from '@angular/core/testing';

import { AppTermListOptionService } from './app-term-list-option.service';

describe('AppTermListOptionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppTermListOptionService = TestBed.get(AppTermListOptionService);
    expect(service).toBeTruthy();
  });
});
