// src/app/core/services/pointage.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { variables } from '../core/environement/variables';
import {
  PointageRequest,
  PointageResponse,
  StatistiquesPointage
} from '../core/models/pointage.model';
import { StatutPointage } from '../core/models/pointage.enums';

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${variables.apiUrl}/api/pointages`;

  // ============ ENDPOINTS EMPLOYÉ ============

  /**
   * Pointer l'arrivée
   */
  pointerArrivee(): Observable<PointageResponse> {
    return this.http.post<PointageResponse>(`${this.apiUrl}/pointer-arrivee`, {});
  }

  /**
   * Pointer le départ
   */
  pointerDepart(): Observable<PointageResponse> {
    return this.http.put<PointageResponse>(`${this.apiUrl}/pointer-depart`, {});
  }

  /**
   * Récupérer mon pointage du jour
   */
  getMonPointageDuJour(): Observable<PointageResponse> {
    return this.http.get<PointageResponse>(`${this.apiUrl}/mon-pointage-du-jour`);
  }

  /**
   * Récupérer mon historique
   */
  getMesPointages(dateDebut: string, dateFin: string): Observable<PointageResponse[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<PointageResponse[]>(`${this.apiUrl}/mes-pointages`, { params });
  }

  /**
   * Récupérer mes statistiques
   */
  getMesStatistiques(dateDebut: string, dateFin: string): Observable<StatistiquesPointage> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<StatistiquesPointage>(`${this.apiUrl}/mes-statistiques`, { params });
  }

  // ============ ENDPOINTS ADMIN/MANAGER ============

  /**
   * Créer un pointage manuel
   */
  creerPointageManuel(request: PointageRequest): Observable<PointageResponse> {
    return this.http.post<PointageResponse>(`${this.apiUrl}/manuel`, request);
  }

  /**
   * Modifier un pointage
   */
  modifierPointage(idPointage: number, request: PointageRequest): Observable<PointageResponse> {
    return this.http.put<PointageResponse>(`${this.apiUrl}/${idPointage}`, request);
  }

  /**
   * Supprimer un pointage
   */
  supprimerPointage(idPointage: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPointage}`);
  }

  /**
   * Récupérer les pointages d'un employé
   */
  getPointagesEmploye(
    idEmploye: number,
    dateDebut: string,
    dateFin: string
  ): Observable<PointageResponse[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<PointageResponse[]>(
      `${this.apiUrl}/employe/${idEmploye}`,
      { params }
    );
  }

  /**
   * Récupérer les statistiques d'un employé
   */
  getStatistiquesEmploye(
    idEmploye: number,
    dateDebut: string,
    dateFin: string
  ): Observable<StatistiquesPointage> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<StatistiquesPointage>(
      `${this.apiUrl}/employe/${idEmploye}/statistiques`,
      { params }
    );
  }

  // ============ VUES GLOBALES ============

  /**
   * Récupérer les pointages d'aujourd'hui
   */
  getPointagesAujourdhui(): Observable<PointageResponse[]> {
    return this.http.get<PointageResponse[]>(`${this.apiUrl}/aujourd-hui`);
  }

  /**
   * Récupérer tous les pointages sur une période
   */
  getTousLesPointages(dateDebut: string, dateFin: string): Observable<PointageResponse[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<PointageResponse[]>(`${this.apiUrl}/periode`, { params });
  }

  /**
   * Récupérer les pointages par statut
   */
  getPointagesByStatut(statut: StatutPointage, date: string): Observable<PointageResponse[]> {
    const params = new HttpParams().set('date', date);

    return this.http.get<PointageResponse[]>(
      `${this.apiUrl}/statut/${statut}`,
      { params }
    );
  }

  /**
   * Récupérer les employés absents
   */
  getEmployesAbsents(date: string): Observable<number[]> {
    const params = new HttpParams().set('date', date);

    return this.http.get<number[]>(`${this.apiUrl}/absents`, { params });
  }

  /**
   * Marquer les absents manuellement
   */
  marquerAbsents(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/marquer-absents`, {});
  }
}
