import { TestBed } from '@angular/core/testing';

import { SupportListService } from './support-list.service';

describe('SupportListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SupportListService = TestBed.inject(SupportListService);
    expect(service).toBeTruthy();
  });
});
