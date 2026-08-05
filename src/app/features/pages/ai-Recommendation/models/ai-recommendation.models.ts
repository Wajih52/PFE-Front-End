export interface AiRecommendationRequest {
  eventType: string;
  guestCount: number;
  budget: string;
  locationType: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface AiRecommendationResponse {
  recommendation: string;
}
