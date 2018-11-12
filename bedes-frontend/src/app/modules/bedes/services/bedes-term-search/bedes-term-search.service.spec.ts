import { TestBed } from '@angular/core/testing';

import { BedesTermSearchService } from './bedes-term-search.service';

describe('BedesTermSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BedesTermSearchService = TestBed.get(BedesTermSearchService);
    expect(service).toBeTruthy();
  });
});
