// src/app/services/statistiques.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStatistiques } from '../core/models/statistiques.model';

/**
 * Service pour gérer les statistiques et analytics
 */
@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/statistiques';

  /**
   * Obtenir toutes les statistiques du dashboard
   * GET /api/statistiques/dashboard
   */
  getDashboardStatistiques(): Observable<DashboardStatistiques> {
    return this.http.get<DashboardStatistiques>(`${this.API_URL}/dashboard`);
  }

  /**
   * Obtenir les statistiques pour une période spécifique
   * GET /api/statistiques/dashboard/periode?dateDebut=...&dateFin=...
   */
  getDashboardStatistiquesPeriode(
    dateDebut: string,
    dateFin: string
  ): Observable<DashboardStatistiques> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<DashboardStatistiques>(
      `${this.API_URL}/dashboard/periode`,
      { params }
    );
  }

  /**
   * Vérifier la santé de l'API statistiques
   * GET /api/statistiques/health
   */
  healthCheck(): Observable<string> {
    return this.http.get(`${this.API_URL}/health`, { responseType: 'text' });
  }

  /**
   * Télécharger un rapport PDF
   */
  telechargerRapportPDF(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/rapports/pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Télécharger un rapport Excel
   */
  telechargerRapportExcel(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/rapports/excel`, {
      responseType: 'blob'
    });
  }
}
