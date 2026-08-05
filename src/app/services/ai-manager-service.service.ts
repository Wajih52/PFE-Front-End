import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import{variables} from '../core/environement/variables';

export interface AiSummaryResponse {
  summary: string;
}

export interface AnalyseAiHistoriqueResponse {
  id: number;
  summary: string;
  createdAt: string;
  generatedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiManagerService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    `${variables.apiUrl}/manager/ai`;

  getSummary(): Observable<AiSummaryResponse> {
    return this.http.get<AiSummaryResponse>(`${this.apiUrl}/summary`);
  }

  getHistory(): Observable<AnalyseAiHistoriqueResponse[]> {
    return this.http.get<AnalyseAiHistoriqueResponse[]>(`${this.apiUrl}/historique`);
  }
}
