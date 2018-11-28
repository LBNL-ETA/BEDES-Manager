import { TestBed } from '@angular/core/testing';

import { BedesTermResolverServiceService } from './bedes-term-resolver-service.service';

describe('BedesTermResolverServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BedesTermResolverServiceService = TestBed.get(BedesTermResolverServiceService);
    expect(service).toBeTruthy();
  });
});
