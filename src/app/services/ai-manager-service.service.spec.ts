import { TestBed } from '@angular/core/testing';

import { AiManagerServiceService } from './ai-manager-service.service';

describe('AiManagerServiceService', () => {
  let service: AiManagerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiManagerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
