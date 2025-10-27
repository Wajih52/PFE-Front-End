import { TestBed } from '@angular/core/testing';

import { TokenMonitorService } from './token-monitor.service';

describe('TokenMonitorService', () => {
  let service: TokenMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
