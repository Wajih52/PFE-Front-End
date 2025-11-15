import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { variables } from '../core/environement/variables';
import {
  PaiementRequestDto,
  PaiementResponseDto,
  RefuserPaiementDto,
  MontantPayeReservationDto,
  PaiementCompletDto,
  StatistiquesPaiementsDto,
  StatutPaiement
} from '../core/models/paiement.model';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  private readonly apiUrl = `${variables.apiUrl}/api/paiements`;

  constructor(private http: HttpClient) { }

  creerPaiement(paiementDto: PaiementRequestDto): Observable<PaiementResponseDto> {
    return this.http.post<PaiementResponseDto>(this.apiUrl, paiementDto);
  }

  validerPaiement(idPaiement: number): Observable<PaiementResponseDto> {
    return this.http.put<PaiementResponseDto>(`${this.apiUrl}/${idPaiement}/valider`, {});
  }

  refuserPaiement(idPaiement: number, motifRefus: string): Observable<PaiementResponseDto> {
    const body: RefuserPaiementDto = { motifRefus };
    return this.http.put<PaiementResponseDto>(`${this.apiUrl}/${idPaiement}/refuser`, body);
  }

  getPaiementById(idPaiement: number): Observable<PaiementResponseDto> {
    return this.http.get<PaiementResponseDto>(`${this.apiUrl}/${idPaiement}`);
  }

  getPaiementByCode(codePaiement: string): Observable<PaiementResponseDto> {
    return this.http.get<PaiementResponseDto>(`${this.apiUrl}/code/${codePaiement}`);
  }

  getPaiementsByReservation(idReservation: number): Observable<PaiementResponseDto[]> {
    return this.http.get<PaiementResponseDto[]>(`${this.apiUrl}/reservation/${idReservation}`);
  }

  getMesPaiements(): Observable<PaiementResponseDto[]> {
    return this.http.get<PaiementResponseDto[]>(`${this.apiUrl}/mes-paiements`);
  }

  getAllPaiements(): Observable<PaiementResponseDto[]> {
    return this.http.get<PaiementResponseDto[]>(this.apiUrl);
  }

  getPaiementsByStatut(statut: StatutPaiement): Observable<PaiementResponseDto[]> {
    return this.http.get<PaiementResponseDto[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getPaiementsEnAttente(): Observable<PaiementResponseDto[]> {
    return this.http.get<PaiementResponseDto[]>(`${this.apiUrl}/en-attente`);
  }

  getPaiementsByPeriode(dateDebut: Date, dateFin: Date): Observable<PaiementResponseDto[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut.toISOString())
      .set('dateFin', dateFin.toISOString());
    return this.http.get<PaiementResponseDto[]>(`${this.apiUrl}/periode`, { params });
  }

  getMontantPaye(idReservation: number): Observable<MontantPayeReservationDto> {
    return this.http.get<MontantPayeReservationDto>(`${this.apiUrl}/reservation/${idReservation}/montant-paye`);
  }

  isReservationPayeeCompletement(idReservation: number): Observable<PaiementCompletDto> {
    return this.http.get<PaiementCompletDto>(`${this.apiUrl}/reservation/${idReservation}/est-complet`);
  }

  supprimerPaiement(idPaiement: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${idPaiement}`);
  }

  getStatistiquesPaiements(): Observable<StatistiquesPaiementsDto> {
    return this.http.get<StatistiquesPaiementsDto>(`${this.apiUrl}/statistiques`);
  }
}
