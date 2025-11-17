// src/app/core/services/instance-produit.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InstanceProduitRequest,
  InstanceProduitResponse, MouvementStockResponse,
  StatutInstance
} from '../core/models';

/**
 * Service de gestion des instances de produits
 * Communique avec le InstanceProduitController Spring Boot
 *
 * Concerne uniquement les produits AVEC_REFERENCE
 */
@Injectable({
  providedIn: 'root'
})
export class InstanceProduitService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/instances';

  // ============ CRUD DE BASE ============

  /**
   * Créer une nouvelle instance
   * POST /api/instances
   * @requires ROLE: ADMIN, EMPLOYE
   */
  creerInstance(dto: InstanceProduitRequest): Observable<InstanceProduitResponse> {
    return this.http.post<InstanceProduitResponse>(this.API_URL, dto);
  }

  /**
   * Créer des instances en lot
   * POST /api/instances/lot?idProduit={id}&quantite={quantite}&prefixeNumeroSerie={prefixe}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  creerInstancesEnLot(
    idProduit: number,
    quantite: number,
    prefixeNumeroSerie: string = 'INST'
  ): Observable<InstanceProduitResponse[]> {
    const params = new HttpParams()
      .set('idProduit', idProduit.toString())
      .set('quantite', quantite.toString())
      .set('prefixeNumeroSerie', prefixeNumeroSerie);
    return this.http.post<InstanceProduitResponse[]>(`${this.API_URL}/lot`, null, { params });
  }

  /**
   * Modifier une instance
   * PUT /api/instances/{id}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  modifierInstance(id: number, dto: InstanceProduitRequest): Observable<InstanceProduitResponse> {
    return this.http.put<InstanceProduitResponse>(`${this.API_URL}/${id}`, dto);
  }

  /**
   * Supprimer une instance
   * DELETE /api/instances/{id}
   * @requires ROLE: ADMIN
   */
  supprimerInstance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // ============ CONSULTATION ============

  /**
   * Obtenir une instance par ID
   * GET /api/instances/{id}
   */
  getInstanceById(id: number): Observable<InstanceProduitResponse> {
    return this.http.get<InstanceProduitResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * Rechercher par numéro de série
   * GET /api/instances/numero-serie/{numeroSerie}
   */
  getInstanceByNumeroSerie(numeroSerie: string): Observable<InstanceProduitResponse> {
    return this.http.get<InstanceProduitResponse>(`${this.API_URL}/numero-serie/${numeroSerie}`);
  }

  /**
   * Lister les instances d'un produit
   * GET /api/instances/produit/{idProduit}
   */
  getInstancesByProduit(idProduit: number): Observable<InstanceProduitResponse[]> {
    return this.http.get<InstanceProduitResponse[]>(`${this.API_URL}/produit/${idProduit}`);
  }

  /**
   * Lister les instances disponibles d'un produit
   * GET /api/instances/produit/{idProduit}/disponibles
   */
  getInstancesDisponibles(idProduit: number): Observable<InstanceProduitResponse[]> {
    return this.http.get<InstanceProduitResponse[]>(`${this.API_URL}/produit/${idProduit}/disponibles`);
  }

  /**
   * Filtrer par statut
   * GET /api/instances/statut/{statut}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getInstancesByStatut(statut: StatutInstance): Observable<InstanceProduitResponse[]> {
    return this.http.get<InstanceProduitResponse[]>(`${this.API_URL}/statut/${statut}`);
  }


  /**
   * Filtrer par statut
   * GET /api/instances/statut/{statut}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getInstances(): Observable<InstanceProduitResponse[]> {
    return this.http.get<InstanceProduitResponse[]>(`${this.API_URL}/all`);
  }

  /**
   * Instances d'une ligne de réservation
   * GET /api/instances/ligne-reservation/{idLigneReservation}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getInstancesByLigneReservation(idLigneReservation: number): Observable<InstanceProduitResponse[]> {
    return this.http.get<InstanceProduitResponse[]>(`${this.API_URL}/ligne-reservation/${idLigneReservation}`);
  }

  // ============ GESTION DES STATUTS ============

  /**
   * Changer le statut d'une instance
   * PATCH /api/instances/{id}/statut?statut={statut}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  changerStatut(id: number, statut: StatutInstance): Observable<InstanceProduitResponse> {
    const params = new HttpParams().set('statut', statut);
    return this.http.patch<InstanceProduitResponse>(`${this.API_URL}/${id}/statut`, null, { params });
  }

  // ============ GESTION DE LA MAINTENANCE ============

  /**
   * Envoyer en maintenance
   * POST /api/instances/{id}/maintenance
   * @requires ROLE: ADMIN, EMPLOYE
   */
  envoyerEnMaintenance(id: number, motif: string): Observable<InstanceProduitResponse> {
    const params = new HttpParams().set('motif',motif)
    return this.http.post<InstanceProduitResponse>(`${this.API_URL}/${id}/maintenance`, null,{params});
  }

  /**
   * Retourner de maintenance
   * POST /api/instances/{id}/retour-maintenance
   * @requires ROLE: ADMIN, EMPLOYE
   */
  retournerDeMaintenance(id: number,dateProchainMaintenance:any): Observable<InstanceProduitResponse> {
    const params = new HttpParams().set('dateProchainMaintenance', dateProchainMaintenance);
    return this.http.post<InstanceProduitResponse>(`${this.API_URL}/${id}/maintenance/retour`, null,{params});
  }

  /**
   * Lister les instances en maintenance
   * GET /api/instances/maintenance
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getInstancesEnMaintenance(): Observable<InstanceProduitResponse[]> {
    return this.http.get<InstanceProduitResponse[]>(`${this.API_URL}/maintenance`);
  }

  /**
   * Maintenances qui vont expirer
   * GET /api/instances/maintenance/expiration?jours={jours}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getMaintenancesExpiration(jours: number): Observable<InstanceProduitResponse[]> {
    const params = new HttpParams().set('jours', jours.toString());
    return this.http.get<InstanceProduitResponse[]>(`${this.API_URL}/maintenance/expiration`, { params });
  }

  // ============ DISPONIBILITÉ ============

  /**
   * Vérifier la disponibilité d'instances pour une période
   * GET /api/instances/disponibilite?idProduit={id}&dateDebut={debut}&dateFin={fin}&quantite={quantite}
   */
  verifierDisponibilite(
    idProduit: number,
    dateDebut: string,
    dateFin: string,
    quantite: number
  ): Observable<InstanceProduitResponse[]> {
    const params = new HttpParams()
      .set('idProduit', idProduit.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin)
      .set('quantite', quantite.toString());
    return this.http.get<InstanceProduitResponse[]>(`${this.API_URL}/disponibilite`, { params });
  }

  // ============ AFFECTATION AUX RÉSERVATIONS (Sprint 4) ============

  /**
   * Affecter une instance à une ligne de réservation
   * POST /api/instances/{id}/affecter?idLigneReservation={idLigne}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  affecterAReservation(id: number, idLigneReservation: number): Observable<InstanceProduitResponse> {
    const params = new HttpParams().set('idLigneReservation', idLigneReservation.toString());
    return this.http.post<InstanceProduitResponse>(`${this.API_URL}/${id}/affecter`, null, { params });
  }

  /**
   * Libérer une instance d'une réservation
   * POST /api/instances/{id}/liberer
   * @requires ROLE: ADMIN, EMPLOYE
   */
  libererDeReservation(id: number): Observable<InstanceProduitResponse> {
    return this.http.post<InstanceProduitResponse>(`${this.API_URL}/${id}/liberer`, null);
  }

  /**
   * Obtenir l'historique des mouvements d'une instance spécifique
   * Utilise le repository MouvementStock avec findByCodeInstanceOrderByDateMouvementDesc
   */
  getHistoriqueMouvementsInstance(numeroSerie: string): Observable<MouvementStockResponse[]> {
    return this.http.get<MouvementStockResponse[]>(
      `${this.API_URL}/historique-instance/${numeroSerie}`
    );
  }
}
