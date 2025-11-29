import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AvisCreateDto,
  AvisUpdateDto,
  AvisModerationDto,
  AvisResponseDto,
  StatistiquesAvisDto,
  StatutAvis
} from '../core/models/avis.model';

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/avis';

  // ============================================
  // CLIENT
  // ============================================

  creerAvis(dto: AvisCreateDto): Observable<AvisResponseDto> {
    return this.http.post<AvisResponseDto>(this.apiUrl, dto);
  }

  modifierAvis(dto: AvisUpdateDto): Observable<AvisResponseDto> {
    return this.http.put<AvisResponseDto>(this.apiUrl, dto);
  }

  supprimerAvis(idAvis: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idAvis}`);
  }

  getMesAvis(): Observable<AvisResponseDto[]> {
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/mes-avis`);
  }

  peutEvaluerProduit(idReservation: number, idProduit: number): Observable<boolean> {
    const params = new HttpParams()
      .set('idReservation', idReservation)
      .set('idProduit', idProduit);
    return this.http.get<boolean>(`${this.apiUrl}/peut-evaluer`, { params });
  }

  // ============================================
  // PUBLIC
  // ============================================

  getAvisProduit(idProduit: number): Observable<AvisResponseDto[]> {
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/produit/${idProduit}`);
  }

  getStatistiquesProduit(idProduit: number): Observable<StatistiquesAvisDto> {
    return this.http.get<StatistiquesAvisDto>(`${this.apiUrl}/produit/${idProduit}/statistiques`);
  }

  rechercherAvis(keyword: string): Observable<AvisResponseDto[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/recherche`, { params });
  }

  getAvisByNote(note: number): Observable<AvisResponseDto[]> {
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/note/${note}`);
  }

  // ============================================
  // ADMIN
  // ============================================

  getAllAvis(): Observable<AvisResponseDto[]> {
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/admin/tous`);
  }

  getAvisEnAttente(): Observable<AvisResponseDto[]> {
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/admin/en-attente`);
  }

  getNombreAvisEnAttente(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/admin/count-en-attente`);
  }

  modererAvis(dto: AvisModerationDto): Observable<AvisResponseDto> {
    return this.http.put<AvisResponseDto>(`${this.apiUrl}/admin/moderer`, dto);
  }

  supprimerAvisDefinitivement(idAvis: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${idAvis}`);
  }

  /**
   * Obtenir les produits les mieux notés (minimum X avis)
   */
  getTopProduitsParNote(minAvis: number = 3): Observable<any[]> {
    const params = new HttpParams().set('minAvis', minAvis.toString());
    return this.http.get<any[]>(`${this.apiUrl}/admin/top-produits`, { params });
  }

  getAvisByStatut(statut: StatutAvis): Observable<AvisResponseDto[]> {
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/admin/statut/${statut}`);
  }

  getAvisByClient(clientId: number): Observable<AvisResponseDto[]> {
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/admin/client/${clientId}`);
  }

  getAllAvisByProduit(idProduit: number): Observable<AvisResponseDto[]> {
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/admin/produit/${idProduit}`);
  }

  getAvisByPeriode(debut: Date, fin: Date): Observable<AvisResponseDto[]> {
    const params = new HttpParams()
      .set('debut', debut.toISOString())
      .set('fin', fin.toISOString());
    return this.http.get<AvisResponseDto[]>(`${this.apiUrl}/admin/periode`, { params });
  }

  modifierVisibilite(idAvis: number, visible: boolean): Observable<AvisResponseDto> {
    const params = new HttpParams().set('visible', visible);
    return this.http.patch<AvisResponseDto>(`${this.apiUrl}/admin/${idAvis}/visibilite`, null, { params });
  }


}
