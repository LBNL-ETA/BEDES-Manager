import { TestBed } from '@angular/core/testing';

import { AppTermService } from './app-term.service';

describe('AppTermService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppTermService = TestBed.get(AppTermService);
    expect(service).toBeTruthy();
  });
});
