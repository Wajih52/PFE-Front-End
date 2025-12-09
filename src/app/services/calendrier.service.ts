// src/app/services/calendrier.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CalendrierEvent,
  CalendrierFiltre,
  CalendrierStatistiques
} from '../core/models/calendrier.model';
import { variables } from '../core/environement/variables';

/**
 * Service Angular pour gérer le calendrier
 * API: /api/calendrier
 */
@Injectable({
  providedIn: 'root'
})
export class CalendrierService {
  private http = inject(HttpClient);
  private readonly API_URL = `${variables.apiUrl}/calendrier`;

  // ============================================
  // RÉCUPÉRATION DES ÉVÉNEMENTS
  // ============================================

  /**
   * 📅 Récupérer les événements avec filtres
   * POST /api/calendrier/evenements
   */
  getEvenements(filtres: CalendrierFiltre): Observable<CalendrierEvent[]> {
    return this.http.post<CalendrierEvent[]>(
      `${this.API_URL}/evenements`,
      filtres
    );
  }

  /**
   *  Événements d'un mois spécifique
   * GET /api/calendrier/mois?annee=2025&mois=6
   */
  getEvenementsMois(annee: number, mois: number): Observable<CalendrierEvent[]> {
    const params = new HttpParams()
      .set('annee', annee.toString())
      .set('mois', mois.toString());

    return this.http.get<CalendrierEvent[]>(
      `${this.API_URL}/mois`,
      { params }
    );
  }

  /**
   *  Obtenir les statistiques pour une période
   * GET /api/calendrier/statistiques?dateDebut=2025-01-01&dateFin=2025-01-31
   */
  getStatistiques(dateDebut: string, dateFin: string): Observable<CalendrierStatistiques> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<CalendrierStatistiques>(
      `${this.API_URL}/statistiques`,
      { params }
    );
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Formater une date au format YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtenir le premier et dernier jour d'un mois
   */
  getMoisRange(date: Date): { debut: string; fin: string } {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      debut: this.formatDate(firstDay),
      fin: this.formatDate(lastDay)
    };
  }

  /**
   * Convertir un CalendrierEvent en événement FullCalendar
   */
  convertToFullCalendarEvent(event: CalendrierEvent): any {
    const titre = event.type === 'RESERVATION'
      ? `📅 ${event.reference}`
      : `🚚 ${event.titre}`;

    return {
      id: `${event.type}-${event.id}`,
      title: titre,
      start: event.dateDebut,
      end: event.dateFin || event.dateDebut,
      backgroundColor: event.couleur,
      borderColor: event.couleur,
      textColor: '#ffffff',
      extendedProps: {
        type: event.type,
        reference: event.reference,
        statut: event.statut,
        client: event.nomClient && event.prenomClient
          ? `${event.prenomClient} ${event.nomClient}`
          : undefined,
        employe: event.nomEmploye && event.prenomEmploye
          ? `${event.prenomEmploye} ${event.nomEmploye}`
          : undefined,
        produits: event.produitsResume,
        montant: event.montantTotal,
        description: event.description,
        adresse: event.adresse,
        heure: event.heure,
        eventData: event
      }
    };
  }
}
