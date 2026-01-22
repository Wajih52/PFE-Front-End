// src/app/core/services/reclamation.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { variables } from '../core/environement/variables';
import {
  ReclamationRequest,
  ReclamationResponse,
  TraiterReclamationDto,
  ClasserReclamationDto,
  ReclamationStatistiques
} from '../core/models/reclamation.model';
import {
  StatutReclamation,
  TypeReclamation,
  PrioriteReclamation
} from '../core/models/reclamation.enums';


@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private http = inject(HttpClient);
  private apiUrl = `${variables.apiUrl}/reclamations`;

  /**
   * Créer une réclamation (visiteur ou client connecté)
   */
  creerReclamation(request: ReclamationRequest): Observable<ReclamationResponse> {
    return this.http.post<ReclamationResponse>(`${this.apiUrl}/create`, request);
  }

  /**
   * Récupérer toutes les réclamations (ADMIN)
   */
  getAllReclamations(): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(this.apiUrl);
  }

  /**
   * Récupérer une réclamation par ID
   */
  getReclamationById(id: number): Observable<ReclamationResponse> {
    return this.http.get<ReclamationResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer une réclamation par code
   */
  getReclamationByCode(code: string): Observable<ReclamationResponse> {
    return this.http.get<ReclamationResponse>(`${this.apiUrl}/code/${code}`);
  }

  /**
   * Récupérer les réclamations de l'utilisateur connecté
   */
  getMesReclamations(): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/mes-reclamations`);
  }

  /**
   * Récupérer les réclamations d'un utilisateur spécifique (ADMIN)
   */
  getReclamationsByUtilisateur(idUtilisateur: number): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/utilisateur/${idUtilisateur}`);
  }

  /**
   * Récupérer les réclamations par email (pour visiteurs)
   */
  getReclamationsByEmail(email: string): Observable<ReclamationResponse[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/email`, { params });
  }

  /**
   * Récupérer les réclamations par statut
   */
  getReclamationsByStatut(statut: StatutReclamation): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/statut/${statut}`);
  }

  /**
   * Récupérer les réclamations par type
   */
  getReclamationsByType(type: TypeReclamation): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/type/${type}`);
  }

  /**
   * Récupérer les réclamations par priorité
   */
  getReclamationsByPriorite(priorite: PrioriteReclamation): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/priorite/${priorite}`);
  }

  /**
   * Récupérer les réclamations liées à une réservation
   */
  getReclamationsByReservation(idReservation: number): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/reservation/${idReservation}`);
  }

  /**
   * Classer une réclamation (priorité + statut)
   */
  classerReclamation(id: number, dto: ClasserReclamationDto): Observable<ReclamationResponse> {
    return this.http.patch<ReclamationResponse>(`${this.apiUrl}/${id}/classer`, dto);
  }

  /**
   * Traiter/Répondre à une réclamation
   */
  traiterReclamation(id: number, dto: TraiterReclamationDto): Observable<ReclamationResponse> {
    return this.http.patch<ReclamationResponse>(`${this.apiUrl}/${id}/traiter`, dto);
  }

  /**
   * Recherche multi-critères
   */
  rechercherReclamations(
    statut?: StatutReclamation,
    type?: TypeReclamation,
    priorite?: PrioriteReclamation,
    idUtilisateur?: number
  ): Observable<ReclamationResponse[]> {
    let params = new HttpParams();

    if (statut) params = params.set('statut', statut);
    if (type) params = params.set('type', type);
    if (priorite) params = params.set('priorite', priorite);
    if (idUtilisateur) params = params.set('idUtilisateur', idUtilisateur.toString());

    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/rechercher`, { params });
  }

  /**
   * Récupérer les réclamations sur une période
   */
  getReclamationsByPeriode(debut: string, fin: string): Observable<ReclamationResponse[]> {
    const params = new HttpParams()
      .set('debut', debut)
      .set('fin', fin);

    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/periode`, { params });
  }

  /**
   * Récupérer les statistiques des réclamations
   */
  getStatistiques(): Observable<ReclamationStatistiques> {
    return this.http.get<ReclamationStatistiques>(`${this.apiUrl}/statistiques`);
  }

  /**
   * Supprimer une réclamation (ADMIN)
   */
  deleteReclamation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
