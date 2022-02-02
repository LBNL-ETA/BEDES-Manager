import { TestBed } from '@angular/core/testing';

import { GlobalAppTermService } from './global-app-term.service';

describe('GlobalAppTermService', () => {
  let service: GlobalAppTermService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalAppTermService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
