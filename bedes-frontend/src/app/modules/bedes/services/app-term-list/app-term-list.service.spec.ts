import { TestBed } from '@angular/core/testing';

import { AppTermListService } from './app-term-list.service';

describe('AppTermListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppTermListService = TestBed.get(AppTermListService);
    expect(service).toBeTruthy();
  });
});
