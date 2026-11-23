import { TestBed } from '@angular/core/testing';

import { OnboardingTourService } from './onboarding-tour.service';

describe('OnboardingTourService', () => {
  let service: OnboardingTourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnboardingTourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
