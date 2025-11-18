// src/app/services/facture.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FactureResponse,
  GenererFactureRequest,
  StatutFacture,
  TypeFacture
} from '../core/models/facture.model';
import { variables } from '../core/environement/variables';

@Injectable({
  providedIn: 'root'
})
export class FactureService {

  private apiUrl = `${variables.apiUrl}/factures`;

  constructor(private http: HttpClient) {}

  // ===== GÉNÉRATION =====

  genererFacture(request: GenererFactureRequest): Observable<FactureResponse> {
    return this.http.post<FactureResponse>(`${this.apiUrl}/generer`, request);
  }

  genererFactureAutomatique(idReservation: number, typeFacture: TypeFacture): Observable<FactureResponse> {
    return this.http.post<FactureResponse>(
      `${this.apiUrl}/generer-auto/${idReservation}/${typeFacture}`,
      {}
    );
  }

  // ===== CONSULTATION =====

  getFactureById(idFacture: number): Observable<FactureResponse> {
    return this.http.get<FactureResponse>(`${this.apiUrl}/${idFacture}`);
  }

  getFactureByNumero(numeroFacture: string): Observable<FactureResponse> {
    return this.http.get<FactureResponse>(`${this.apiUrl}/numero/${numeroFacture}`);
  }

  getFacturesByReservation(idReservation: number): Observable<FactureResponse[]> {
    return this.http.get<FactureResponse[]>(`${this.apiUrl}/reservation/${idReservation}`);
  }

  getFacturesByClient(idClient: number): Observable<FactureResponse[]> {
    return this.http.get<FactureResponse[]>(`${this.apiUrl}/client/${idClient}`);
  }

  getAllFactures(): Observable<FactureResponse[]> {
    return this.http.get<FactureResponse[]>(`${this.apiUrl}/toutes`);
  }

  // ===== FILTRES =====

  getFacturesByStatut(statut: StatutFacture): Observable<FactureResponse[]> {
    return this.http.get<FactureResponse[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getFacturesByType(type: TypeFacture): Observable<FactureResponse[]> {
    return this.http.get<FactureResponse[]>(`${this.apiUrl}/type/${type}`);
  }

  // ===== TÉLÉCHARGEMENT PDF =====

  telechargerPdfFacture(idFacture: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idFacture}/telecharger`, {
      responseType: 'blob'
    });
  }

  // Téléchargement direct avec création du lien
  downloadFacturePdf(idFacture: number, numeroFacture: string): void {
    this.telechargerPdfFacture(idFacture).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${numeroFacture}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur téléchargement PDF:', error);
      }
    });
  }

  // ===== MISE À JOUR =====

  updateStatutFacture(idFacture: number, nouveauStatut: StatutFacture): Observable<FactureResponse> {
    return this.http.put<FactureResponse>(
      `${this.apiUrl}/${idFacture}/statut/${nouveauStatut}`,
      {}
    );
  }

  regenererPdfFacture(idFacture: number): Observable<FactureResponse> {
    return this.http.post<FactureResponse>(
      `${this.apiUrl}/${idFacture}/regenerer-pdf`,
      {}
    );
  }
}
