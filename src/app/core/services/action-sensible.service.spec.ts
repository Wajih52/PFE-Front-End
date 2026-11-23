import { TestBed } from '@angular/core/testing';

import { ActionSensibleService } from './action-sensible.service';

describe('ActionSensibleService', () => {
  let service: ActionSensibleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionSensibleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
