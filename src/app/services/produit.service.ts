// src/app/core/services/produit.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProduitRequest,
  ProduitResponse,
  StockStatistiques,
  MouvementStockResponse,
  Categorie,
  TypeMouvement
} from '../core/models';

/**
 * Service de gestion des produits
 * Communique avec le ProduitController Spring Boot
 *
 * Sprint 3 : Gestion des produits et du stock
 */
@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/produits';

  // ============ GESTION DES PRODUITS ============

  /**
   * Créer un nouveau produit
   * POST /api/produits
   * @requires ROLE: ADMIN, EMPLOYE
   */
  creerProduit(produitDto: ProduitRequest): Observable<ProduitResponse> {
    return this.http.post<ProduitResponse>(this.API_URL, produitDto);
  }

  /**
   * Modifier un produit existant
   * PUT /api/produits/{id}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  modifierProduit(id: number, produitDto: ProduitRequest): Observable<ProduitResponse> {
    return this.http.put<ProduitResponse>(`${this.API_URL}/${id}`, produitDto);
  }

  /**
   * Supprimer (désactiver) un produit
   * DELETE /api/produits/{id}
   * @requires ROLE: ADMIN
   */
  supprimerProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);

  }

  /**
   * Supprimer (De la base de données) un produit
   * DELETE /api/produits/{id}
   * @requires ROLE: ADMIN
   */
  supprimerProduitDeBase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/base`);

  }

  /**
   * Activer/Désactiver un produit
   * PATCH /api/produits/{id}/activer
   * @requires ROLE: ADMIN
   */
  toggleActifProduit(id: number, actif: boolean): Observable<ProduitResponse> {
    return this.http.patch<ProduitResponse>(`${this.API_URL}/${id}/activer`, null, {
      params: { actif: actif.toString() }
    });
  }

  // ============ CONSULTATION ============

  /**
   * Obtenir un produit par ID
   * GET /api/produits/{id}
   */
  getProduitById(id: number): Observable<ProduitResponse> {
    return this.http.get<ProduitResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtenir tous les produits
   * GET /api/produits
   */
  getAllProduits(): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(this.API_URL);
  }

  /**
   * Obtenir les produits disponibles (quantité > 0)
   * GET /api/produits/disponibles
   */
  getProduitsDisponibles(): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(`${this.API_URL}/disponibles`);
  }

  /**
   * Obtenir les produits en rupture de stock
   * GET /api/produits/rupture
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getProduitsEnRupture(): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(`${this.API_URL}/rupture`);
  }

  /**
   * Obtenir les produits avec stock critique
   * GET /api/produits/stock-critique?seuil={seuil}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getProduitsStockCritique(seuil?: number): Observable<ProduitResponse[]> {
    let params = new HttpParams();
    if (seuil) {
      params = params.set('seuil', seuil.toString());
    }
    return this.http.get<ProduitResponse[]>(`${this.API_URL}/stock-critique`, { params });
  }

  /**
   * Rechercher des produits par nom
   * GET /api/produits/search?nom={nom}
   */
  searchProduitsByNom(nom: string): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(`${this.API_URL}/search`, {
      params: { nom }
    });
  }

  /**
   * Filtrer par catégorie
   * GET /api/produits/categorie/{categorie}
   */
  getProduitsByCategorie(categorie: Categorie): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(`${this.API_URL}/categorie/${categorie}`);
  }

  /**
   * Filtrer par type de produit
   * GET /api/produits/type/{type}
   */
  getProduitsByType(type: string): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(`${this.API_URL}/type/${type}`);
  }

  // ============ GESTION DU STOCK (SANS_REFERENCE) ============

  /**
   * Ajouter du stock à un produit SANS_REFERENCE
   * POST /api/produits/{id}/ajout-stock?quantite={quantite}&motif={motif}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  ajouterStock(id: number, quantite: number, motif?: string): Observable<ProduitResponse> {
    let params = new HttpParams().set('quantite', quantite.toString());
    if (motif) {
      params = params.set('motif', motif);
    }
    return this.http.post<ProduitResponse>(`${this.API_URL}/${id}/ajout-stock`, null, { params });
  }

  /**
   * Retirer du stock d'un produit SANS_REFERENCE
   * POST /api/produits/{id}/retrait-stock?quantite={quantite}&motif={motif}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  retirerStock(id: number, quantite: number, motif?: string): Observable<ProduitResponse> {
    let params = new HttpParams().set('quantite', quantite.toString());
    if (motif) {
      params = params.set('motif', motif);
    }
    return this.http.post<ProduitResponse>(`${this.API_URL}/${id}/retrait-stock`, null, { params });
  }

  /**
   * Corriger le stock d'un produit SANS_REFERENCE
   * PATCH /api/produits/{id}/correction-stock?nouvelleQuantite={quantite}&motif={motif}
   * @requires ROLE: ADMIN
   */
  corrigerStock(id: number, nouvelleQuantite: number, motif: string): Observable<ProduitResponse> {
    const params = new HttpParams()
      .set('nouvelleQuantite', nouvelleQuantite.toString())
      .set('motif', motif);
    return this.http.patch<ProduitResponse>(`${this.API_URL}/${id}/correction-stock`, null, { params });
  }

  // ============ HISTORIQUE DES MOUVEMENTS ============

  /**
   * Obtenir l'historique complet des mouvements d'un produit
   * GET /api/produits/{id}/historique
   */
  getHistoriqueMouvements(id: number): Observable<MouvementStockResponse[]> {
    return this.http.get<MouvementStockResponse[]>(`${this.API_URL}/${id}/historique`);
  }

  /**
   * Obtenir l'historique des mouvements d'un produit
   * GET /api/produits/{id}/mouvements
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getMouvementsProduit(id: number): Observable<MouvementStockResponse[]> {
    return this.http.get<MouvementStockResponse[]>(`${this.API_URL}/${id}/mouvements`);
  }

  /**
   * Filtrer les mouvements par type
   * GET /api/produits/{id}/mouvements/type/{type}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getMouvementsByType(id: number, type: TypeMouvement): Observable<MouvementStockResponse[]> {
    return this.http.get<MouvementStockResponse[]>(`${this.API_URL}/${id}/mouvements/type/${type}`);
  }

  /**
   * Filtrer les mouvements par période
   * GET /api/produits/{id}/mouvements/periode?debut={debut}&fin={fin}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getMouvementsByPeriode(id: number, debut: string, fin: string): Observable<MouvementStockResponse[]> {
    const params = new HttpParams()
      .set('debut', debut)
      .set('fin', fin);
    return this.http.get<MouvementStockResponse[]>(`${this.API_URL}/${id}/mouvements/periode`, { params });
  }

  // ============ STATISTIQUES ============

  /**
   * Obtenir les statistiques globales du stock
   * GET /api/produits/statistiques
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getStatistiquesStock(): Observable<StockStatistiques> {
    return this.http.get<StockStatistiques>(`${this.API_URL}/statistiques`);
  }

  /**
   * Vérifier la disponibilité d'un produit pour une période
   * GET /api/produits/{id}/disponibilite?dateDebut={debut}&dateFin={fin}&quantite={quantite}
   */
  verifierDisponibilite(
    id: number,
    dateDebut: string,
    dateFin: string,
    quantite: number
  ): Observable<boolean> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin)
      .set('quantite', quantite.toString());
    return this.http.get<boolean>(`${this.API_URL}/${id}/disponibilite`, { params });
  }
}
