import { TestBed } from '@angular/core/testing';

import { BedesSearchResultsService } from './bedes-search-results.service';

describe('BedesSearchResultsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BedesSearchResultsService = TestBed.inject(BedesSearchResultsService);
    expect(service).toBeTruthy();
  });
});
