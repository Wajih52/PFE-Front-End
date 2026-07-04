import { TestBed } from '@angular/core/testing';

import { AiRecommendationServiceService } from './ai-recommendation.service';

describe('AiRecommendationServiceService', () => {
  let service: AiRecommendationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiRecommendationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
