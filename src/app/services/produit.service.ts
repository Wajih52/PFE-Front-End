// src/app/services/produit.service.ts - VERSION COMPLÈTE AVEC APIs DU BACKEND

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Categorie,
  MouvementStockResponse,
  ProduitRequest,
  ProduitResponse, StockStatistiques,
  TypeMouvement,
  TypeProduit
} from '../core/models';

// ==================== INTERFACES ===================



/**
 * Response de disponibilité sur une période
 */
export interface DisponibilitePeriodeResponse {
  idProduit: number;
  quantiteDemandee: number;
  dateDebut: string;
  dateFin: string;
  disponible: boolean;
  quantiteDisponible?: number;
  message: string;
}

// ==================== SERVICE ====================

/**
 * Service de gestion des produits
 * ✅ VERSION COMPLÈTE avec toutes les APIs du ProduitController
 */
@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/produits';

  // ============================================
  // GESTION DES PRODUITS (CRUD)
  // ============================================

  /**
   * Créer un nouveau produit
   * POST /api/produits
   * @requires ROLE: ADMIN, EMPLOYE
   */
  creerProduit(produit: ProduitRequest): Observable<ProduitResponse> {
    return this.http.post<ProduitResponse>(this.API_URL, produit);
  }

  /**
   * Modifier un produit
   * PUT /api/produits/{id}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  modifierProduit(id: number, produit: ProduitRequest): Observable<ProduitResponse> {
    return this.http.put<ProduitResponse>(`${this.API_URL}/${id}`, produit);
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
   * Obtenir un produit par ID
   * GET /api/produits/{id}
   */
  getProduitById(id: number): Observable<ProduitResponse> {
    return this.http.get<ProduitResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * Obtenir tous les produits (sans filtre de dates)
   * GET /api/produits
   * ⚠️ NE PREND PAS EN COMPTE LES PÉRIODES - pour usage admin uniquement
   */
  getAllProduits(): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(this.API_URL);
  }

  // ============================================
  // RECHERCHE ET FILTRAGE (SANS PÉRIODE)
  // ============================================

  /**
   * Obtenir les produits disponibles (stock global > 0)
   * GET /api/produits/disponibles
   * ⚠️ NE PREND PAS EN COMPTE LES PÉRIODES - pour usage admin uniquement
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
   * ⚠️ INUTILE POUR LE CLIENT - uniquement usage interne admin
   */
  getProduitsByType(type: TypeProduit): Observable<ProduitResponse[]> {
    return this.http.get<ProduitResponse[]>(`${this.API_URL}/type/${type}`);
  }

  // ============================================
  // ✅ DISPONIBILITÉ AVEC PÉRIODE (APIs CRITIQUES)
  // ============================================

  /**
   * ✅ Calculer la quantité disponible pour une période donnée
   * GET /api/produits/{id}/quantite-disponible?dateDebut={date}&dateFin={date}
   *
   * Retourne la quantité réellement disponible en tenant compte des réservations
   */
  calculerQuantiteDisponibleSurPeriode(
    id: number,
    dateDebut: string,
    dateFin: string
  ): Observable<number> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<number>(`${this.API_URL}/${id}/quantite-disponible`, { params });
  }

  /**
   * ✅ Vérifier la disponibilité d'un produit pour une période
   * GET /api/produits/{id}/disponibilite-periode?quantite={qte}&dateDebut={date}&dateFin={date}
   *
   * Vérifie si une quantité spécifique est disponible
   */
  verifierDisponibiliteSurPeriode(
    id: number,
    quantite: number,
    dateDebut: string,
    dateFin: string
  ): Observable<DisponibilitePeriodeResponse> {
    const params = new HttpParams()
      .set('quantite', quantite.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<DisponibilitePeriodeResponse>(
      `${this.API_URL}/${id}/disponibilite-periode`,
      { params }
    );
  }

  /**
   * ✅ Obtenir le catalogue disponible sur une période
   * GET /api/produits/catalogue-disponible?dateDebut={date}&dateFin={date}
   *
   * 🎯 API PRINCIPALE POUR LE CATALOGUE CLIENT
   * Retourne uniquement les produits réellement disponibles pendant la période
   */
  getCatalogueDisponibleSurPeriode(
    dateDebut: any,
    dateFin: any
  ): Observable<ProduitResponse[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<ProduitResponse[]>(
      `${this.API_URL}/catalogue-disponible`,
      { params }
    );
  }

  /**
   * ✅ Recherche multicritères avec période
   * GET /api/produits/search-periode
   *
   * Permet de filtrer les produits disponibles selon plusieurs critères
   * ET une période de disponibilité
   */
  searchProduitsAvecPeriode(filters: {
    categorie?: Categorie;
    typeProduit?: TypeProduit;
    minPrix?: number;
    maxPrix?: number;
    dateDebut?: any;
    dateFin?: any;
  }): Observable<ProduitResponse[]> {
    let params = new HttpParams();

    if (filters.categorie) {
      params = params.set('categorie', filters.categorie);
    }
    if (filters.typeProduit) {
      params = params.set('typeProduit', filters.typeProduit);
    }
    if (filters.minPrix !== undefined) {
      params = params.set('minPrix', filters.minPrix.toString());
    }
    if (filters.maxPrix !== undefined) {
      params = params.set('maxPrix', filters.maxPrix.toString());
    }
    if (filters.dateDebut) {
      params = params.set('dateDebut', filters.dateDebut);
    }
    if (filters.dateFin) {
      params = params.set('dateFin', filters.dateFin);
    }

    return this.http.get<ProduitResponse[]>(`${this.API_URL}/recherche-avec-periode`, { params });
  }

  // ============================================
  // GESTION DU STOCK (SANS_REFERENCE)
  // ============================================

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

  // ============================================
  // HISTORIQUE DES MOUVEMENTS
  // ============================================

  /**
   * Obtenir l'historique des mouvements de stock d'un produit
   * GET /api/produits/{id}/mouvements
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getHistoriqueMouvements(id: number): Observable<MouvementStockResponse[]> {
    return this.http.get<MouvementStockResponse[]>(`${this.API_URL}/${id}/mouvements`);
  }

  /**
   * Obtenir l'historique des mouvements par type
   * GET /api/produits/{id}/mouvements/type?typeMouvement={type}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getHistoriqueMouvementsByType(
    id: number,
    typeMouvement: 'ENTREE' | 'SORTIE' | 'RETOUR' | 'PERTE' | 'CASSE'
  ): Observable<MouvementStockResponse[]> {
    return this.http.get<MouvementStockResponse[]>(
      `${this.API_URL}/${id}/mouvements/type`,
      { params: { typeMouvement } }
    );
  }

  /**
   * Obtenir l'historique des mouvements sur une période
   * GET /api/produits/{id}/mouvements/periode?debut={date}&fin={date}
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getHistoriqueMouvementsPeriode(id: number, debut: string, fin: string): Observable<MouvementStockResponse[]> {
    const params = new HttpParams()
      .set('debut', debut)
      .set('fin', fin);
    return this.http.get<MouvementStockResponse[]>(`${this.API_URL}/${id}/mouvements/periode`, { params });
  }

  // ============================================
  // STATISTIQUES
  // ============================================

  /**
   * Obtenir les statistiques globales du stock
   * GET /api/produits/statistiques
   * @requires ROLE: ADMIN, EMPLOYE
   */
  getStatistiquesStock(): Observable<StockStatistiques> {
    return this.http.get<StockStatistiques>(`${this.API_URL}/statistiques`);
  }
}
