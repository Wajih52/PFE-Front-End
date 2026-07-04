import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { variables } from '../../../../core/environement/variables';
import {
  AiRecommendationRequest,
  AiRecommendationResponse
} from '../models/ai-recommendation.models';

@Injectable({
  providedIn: 'root'
})
export class AiRecommendationService {

  private readonly apiUrl = `${variables.apiUrl}/ai/recommendations`;

  constructor(private http: HttpClient) {}

  generateEventPackRecommendation(
    request: AiRecommendationRequest
  ): Observable<AiRecommendationResponse> {
    return this.http.post<AiRecommendationResponse>(
      `${this.apiUrl}/event-pack`,
      request
    );
  }
}
