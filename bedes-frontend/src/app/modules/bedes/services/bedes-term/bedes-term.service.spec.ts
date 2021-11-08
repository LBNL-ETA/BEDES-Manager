import { TestBed } from '@angular/core/testing';

import { BedesTermService } from './bedes-term.service';

describe('BedesTermService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BedesTermService = TestBed.inject(BedesTermService);
    expect(service).toBeTruthy();
  });
});
