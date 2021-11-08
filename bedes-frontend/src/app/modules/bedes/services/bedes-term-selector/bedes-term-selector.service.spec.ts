import { TestBed } from '@angular/core/testing';

import { BedesTermSelectorService } from './bedes-term-selector.service';

describe('BedesTermSelectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BedesTermSelectorService = TestBed.inject(BedesTermSelectorService);
    expect(service).toBeTruthy();
  });
});
