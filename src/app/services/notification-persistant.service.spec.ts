import { TestBed } from '@angular/core/testing';

import { NotificationPersistantService } from './notification-persistant.service';

describe('NotificationPersistantService', () => {
  let service: NotificationPersistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationPersistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
