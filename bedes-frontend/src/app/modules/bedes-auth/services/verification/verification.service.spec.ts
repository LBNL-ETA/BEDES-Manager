import { TestBed } from '@angular/core/testing';

import { VerificationService } from './verification.service';

describe('VerificationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VerificationService = TestBed.inject(VerificationService);
    expect(service).toBeTruthy();
  });
});
