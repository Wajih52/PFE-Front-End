import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { variables } from '../core/environement/variables';
import { DemandeCongeRequest, DemandeCongeResponse } from '../core/models/conge.model';

@Injectable({
  providedIn: 'root'
})
export class CongeService {

  private http = inject(HttpClient);
  private apiUrl = `${variables.apiUrl}/conges`;

  // === EMPLOYÉ ===
  demanderConge(request: DemandeCongeRequest): Observable<DemandeCongeResponse> {
    return this.http.post<DemandeCongeResponse>(`${this.apiUrl}/demander`, request);
  }

  getMesDemandes(): Observable<DemandeCongeResponse[]> {
    return this.http.get<DemandeCongeResponse[]>(`${this.apiUrl}/mes-demandes`);
  }

  // === ADMIN / MANAGER ===
  getToutesLesDemandes(): Observable<DemandeCongeResponse[]> {
    return this.http.get<DemandeCongeResponse[]>(`${this.apiUrl}/toutes`);
  }

  traiterDemande(idDemande: number, accepter: boolean): Observable<DemandeCongeResponse> {
    const params = new HttpParams().set('accepter', accepter.toString());
    return this.http.patch<DemandeCongeResponse>(`${this.apiUrl}/${idDemande}/traiter`, {}, { params });
  }

  modifierSoldeEmploye(idEmploye: number, nouveauSolde: number): Observable<void> {
    const params = new HttpParams().set('nouveauSolde', nouveauSolde.toString());
    return this.http.patch<void>(`${this.apiUrl}/employe/${idEmploye}/solde`, {}, { params });
  }
}
