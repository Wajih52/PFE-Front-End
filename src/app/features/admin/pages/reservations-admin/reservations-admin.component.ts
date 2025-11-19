// src/app/features/admin/reservations-admin/reservations-admin.component.ts
// 👑 Composant ADMIN - Liste complète des réservations avec filtres avancés

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../../../services/reservation.service';
import {
  ReservationResponseDto,
  ReservationSearchDto,
  StatutReservation,
  StatutReservationLabels
} from '../../../../core/models/reservation.model';
import { FactureService } from '../../../../services/facture.service';
import { TypeFacture } from '../../../../core/models/facture.model';



@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations-admin.component.html',
  styleUrls: ['./reservations-admin.component.scss']
})
export class ReservationsAdminComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private factureService = inject(FactureService);



  // Signals
  reservations = signal<ReservationResponseDto[]>([]);
  reservationsFiltrees = signal<ReservationResponseDto[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage=signal<string>('');

  // Filtres
  filtreStatut = signal<StatutReservation | 'TOUS'>('TOUS');
  rechercheReference = signal<string>('');
  rechercheNom = signal<string>('');
  rechercheEmail = signal<string>('');
  filtreDateDebut = signal<string>('');
  filtreDateFin = signal<string>('');
  filtreMontantMin = signal<number | null>(null);
  filtreMontantMax = signal<number | null>(null);

  // Labels
  readonly statutLabels = StatutReservationLabels;
  readonly statuts: (StatutReservation | 'TOUS')[] = [
    'TOUS',
    'EN_ATTENTE',
    'CONFIRME',
    'EN_COURS',
    'TERMINE',
    'ANNULE'
  ];

  // Tri
  triColonne = signal<string>('dateCreation');
  triOrdre = signal<'asc' | 'desc'>('desc');

  generatingFacture = signal<{ id: number, type: TypeFacture } | null>(null);

  ngOnInit(): void {
    this.chargerReservations();
  }

  /**
   * Charger toutes les réservations
   */
  chargerReservations(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.appliquerFiltres();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.errorMessage.set('Impossible de charger les réservations.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Appliquer les filtres
   */
  appliquerFiltres(): void {
    let result = [...this.reservations()];

    // Filtre par statut
    if (this.filtreStatut() !== 'TOUS') {
      result = result.filter(r => r.statutReservation === this.filtreStatut());
    }

    // Recherche par référence
    if (this.rechercheReference()) {
      const search = this.rechercheReference().toLowerCase();
      result = result.filter(r =>
        r.referenceReservation.toLowerCase().includes(search)
      );
    }

    // Recherche par nom
    if (this.rechercheNom()) {
      const search = this.rechercheNom().toLowerCase();
      result = result.filter(r =>
        r.nomClient.toLowerCase().includes(search) ||
        r.prenomClient.toLowerCase().includes(search)
      );
    }

    // Recherche par email
    if (this.rechercheEmail()) {
      const search = this.rechercheEmail().toLowerCase();
      result = result.filter(r =>
        r.emailClient.toLowerCase().includes(search)
      );
    }

    // Filtre par dates
    if (this.filtreDateDebut()) {
      result = result.filter(r =>
        new Date(r.dateDebut) >= new Date(this.filtreDateDebut())
      );
    }

    if (this.filtreDateFin()) {
      result = result.filter(r =>
        new Date(r.dateFin) <= new Date(this.filtreDateFin())
      );
    }

    // Filtre par montant
    if (this.filtreMontantMin() !== null) {
      result = result.filter(r => r.montantTotal >= this.filtreMontantMin()!);
    }

    if (this.filtreMontantMax() !== null) {
      result = result.filter(r => r.montantTotal <= this.filtreMontantMax()!);
    }

    // Tri
    result = this.trierReservations(result);

    this.reservationsFiltrees.set(result);
  }

  /**
   * Trier les réservations
   */
  trierReservations(reservations: ReservationResponseDto[]): ReservationResponseDto[] {
    const colonne = this.triColonne();
    const ordre = this.triOrdre();

    return reservations.sort((a, b) => {
      let valA: any, valB: any;

      switch (colonne) {
        case 'dateCreation':
          valA = new Date(a.dateCreation);
          valB = new Date(b.dateCreation);
          break;
        case 'dateDebut':
          valA = new Date(a.dateDebut);
          valB = new Date(b.dateDebut);
          break;
        case 'client':
          valA = `${a.prenomClient} ${a.nomClient}`;
          valB = `${b.prenomClient} ${b.nomClient}`;
          break;
        case 'montant':
          valA = a.montantTotal;
          valB = b.montantTotal;
          break;
        case 'reference':
          valA = a.referenceReservation;
          valB = b.referenceReservation;
          break;
        default:
          return 0;
      }

      if (valA < valB) return ordre === 'asc' ? -1 : 1;
      if (valA > valB) return ordre === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Changer le tri
   */
  changerTri(colonne: string): void {
    if (this.triColonne() === colonne) {
      // Inverser l'ordre
      this.triOrdre.set(this.triOrdre() === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouvelle colonne, ordre descendant par défaut
      this.triColonne.set(colonne);
      this.triOrdre.set('desc');
    }
    this.appliquerFiltres();
  }

  /**
   * Réinitialiser les filtres
   */
  reinitialiserFiltres(): void {
    this.filtreStatut.set('TOUS');
    this.rechercheReference.set('');
    this.rechercheNom.set('');
    this.rechercheEmail.set('');
    this.filtreDateDebut.set('');
    this.filtreDateFin.set('');
    this.filtreMontantMin.set(null);
    this.filtreMontantMax.set(null);
    this.appliquerFiltres();
  }

  /**
   * Statistiques
   */
  get stats() {
    const all = this.reservations();
    return {
      total: all.length,
      enAttente: all.filter(r => r.statutReservation === 'EN_ATTENTE').length,
      confirmees: all.filter(r => r.statutReservation === 'CONFIRME').length,
      enCours: all.filter(r => r.statutReservation === 'EN_COURS').length,
      terminees: all.filter(r => r.statutReservation === 'TERMINE').length,
      annulees: all.filter(r => r.statutReservation === 'ANNULE').length,
      chiffreAffaires: all
        .filter(r => r.statutReservation !== 'ANNULE')
        .reduce((sum, r) => sum + r.montantTotal, 0)
    };
  }

  /**
   * Voir les détails
   */
  voirDetails(idReservation: number): void {
    this.router.navigate(['/admin/reservation-details', idReservation]);
  }
  /**
   * Naviguer vers la page d'ajout de paiement
   */
  ajouterPaiement(idReservation: number): void {
    this.router.navigate(['/reservations', idReservation, 'ajouter-paiement']);
  }
  /**
   * Exporter en CSV
   */
  exporterCSV(): void {
    const data = this.reservationsFiltrees();
    let csv = 'Référence,Client,Email,Date début,Date fin,Statut,Montant\n';

    data.forEach(r => {
      csv += `${r.referenceReservation},${r.prenomClient} ${r.nomClient},${r.emailClient},${r.dateDebut},${r.dateFin},${r.statutReservation},${r.montantTotal}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Générer une facture selon le type
   */
  genererFacture(reservation: ReservationResponseDto, typeFacture: TypeFacture): void {
    const typeLabels = {
      'DEVIS': 'Devis',
      'PRO_FORMA': 'Pro-forma',
      'FINALE': 'Facture Finale'
    };

    const confirmation = confirm(
      `Générer une facture ${typeLabels[typeFacture]} pour ${reservation.referenceReservation} ?\n` +
      `Montant: ${reservation.montantTotal.toFixed(2)} DT`
    );

    if (!confirmation) return;

    this.generatingFacture.set({
      id: reservation.idReservation,
      type: typeFacture
    });

    this.factureService.genererFactureAutomatique(
      reservation.idReservation,
      typeFacture
    ).subscribe({
      next: (facture) => {
        this.successMessage.set(
          `✅ Facture ${typeLabels[typeFacture]} ${facture.numeroFacture} générée !`
        );
        this.generatingFacture.set(null);

        // Télécharger automatiquement
        setTimeout(() => {
          this.factureService.downloadFacturePdf(
            facture.idFacture,
            facture.numeroFacture
          );
        }, 500);
      },
      error: (error) => {
        this.errorMessage.set('Impossible de générer la facture');
        this.generatingFacture.set(null);
      }
    });
  }

  /**
   * Vérifier quel type de facture peut être généré
   */
  peutGenererFacture(reservation: ReservationResponseDto, type: TypeFacture): boolean {
    switch (type) {
      case TypeFacture.DEVIS:
        return reservation.statutReservation === 'EN_ATTENTE';

      case TypeFacture.PRO_FORMA:
        return reservation.statutReservation === 'CONFIRME';

      case TypeFacture.FINALE:
        return reservation.statutReservation === 'TERMINE' &&
          reservation.paiementComplet;

      default:
        return false;
    }
  }

  /**
   * Vérifier si génération en cours pour cette réservation
   */
  isGenerating(idReservation: number, type: TypeFacture): boolean {
    const gen = this.generatingFacture();
    return gen !== null && gen.id === idReservation && gen.type === type;
  }
  // ============ HELPERS ============

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatutBadgeClass(statut: string): string {
    return this.reservationService.getStatutBadgeClass(statut as any);
  }

  getStatutLabel(statut: StatutReservation | 'TOUS'): string {
    if (statut === 'TOUS') return 'Tous';
    return this.statutLabels[statut];
  }

  protected readonly TypeFacture = TypeFacture;
}
