import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaiementService } from '../../../../services/paiement.service';
import { ReservationService } from '../../../../services/reservation.service';
import { StorageService } from '../../../../core/services/storage.service';
import {
  ModePaiement,
  ModePaiementLabels,
  formatMontantTND
} from '../../../../core/models/paiement.model';
import { ReservationResponseDto } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-ajouter-paiement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ajouter-paiement.component.html',
  styleUrls: ['./ajouter-paiement.component.scss']
})
export class AjouterPaiementComponent implements OnInit {

  paiementForm!: FormGroup;
  idReservation!: number;
  reservation: ReservationResponseDto | null = null;

  loading: boolean = false;
  erreur: string | null = null;
  succes: boolean = false;

  readonly modesPaiement = Object.values(ModePaiement);
  readonly modePaiementLabels = ModePaiementLabels;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paiementService: PaiementService,
    private reservationService: ReservationService,
  private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.idReservation = +this.route.snapshot.params['idReservation'];
    this.initForm();
    this.chargerReservation();
  }

  initForm(): void {
    this.paiementForm = this.fb.group({
      montantPaiement: ['', [Validators.required, Validators.min(1)]],
      modePaiement: [ModePaiement.ESPECES, Validators.required],
      descriptionPaiement: [''],
      referenceExterne: ['']
    });
  }

  chargerReservation(): void {
    this.loading = true;
    this.erreur = null;

    this.reservationService.getReservationById(this.idReservation).subscribe({
      next: (data) => {
        this.reservation = data;
        this.loading = false;

        if (data.paiementComplet) {
          this.erreur = 'Cette réservation est déjà payée intégralement';
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la réservation:', error);
        this.erreur = 'Impossible de charger la réservation';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.paiementForm.invalid || !this.reservation) {
      this.paiementForm.markAllAsTouched();
      return;
    }

    const montantSaisi = this.paiementForm.value.montantPaiement;
    if (montantSaisi > this.reservation.montantRestant) {
      this.erreur = `Le montant ne peut pas dépasser le montant restant (${formatMontantTND(this.reservation.montantRestant)})`;
      return;
    }

    this.loading = true;
    this.erreur = null;

    const paiementDto = {
      idReservation: this.idReservation,
      ...this.paiementForm.value
    };

    this.paiementService.creerPaiement(paiementDto).subscribe({
      next: (response) => {
        this.succes = true;
        this.loading = false;

        alert(`✅ Paiement enregistré avec succès !\n\nCode: ${response.codePaiement}\nMontant: ${formatMontantTND(response.montantPaiement)}\n\nVotre paiement est en attente de validation par un administrateur.`);

        this.router.navigate(['client/mes-reservations']);
      },
      error: (error) => {
        console.error('Erreur lors de la création du paiement:', error);
        this.erreur = error.error?.message || 'Erreur lors de l\'enregistrement du paiement';
        this.loading = false;
      }
    });
  }

  payerMontantRestant(): void {
    if (this.reservation) {
      this.paiementForm.patchValue({
        montantPaiement: this.reservation.montantRestant
      });
    }
  }

  payerAcompte30(): void {
    if (this.reservation) {
      const acompte = this.reservation.montantRestant * 0.3;
      this.paiementForm.patchValue({
        montantPaiement: Math.round(acompte * 100) / 100
      });
    }
  }

  payerAcompte50(): void {
    if (this.reservation) {
      const acompte = this.reservation.montantRestant * 0.5;
      this.paiementForm.patchValue({
        montantPaiement: Math.round(acompte * 100) / 100
      });
    }
  }

  formatMontant(montant: number): string {
    return formatMontantTND(montant);
  }

  calculerMontantRestantApres(): number {
    if (!this.reservation) return 0;

    const montantSaisi = this.paiementForm.value.montantPaiement || 0;
    return Math.max(0, this.reservation.montantRestant - montantSaisi);
  }

  getModePaiementLabel(mode: ModePaiement|string): string {
    return this.modePaiementLabels[mode as ModePaiement];
  }

  get montantPaiementControl():AbstractControl |null {
    return this.paiementForm.get('montantPaiement');
  }

  get modePaiementControl():AbstractControl |null {
    return this.paiementForm.get('modePaiement');
  }

  /**
   * Retourne la route de retour selon le rôle de l'utilisateur
   */
  getRouteAnnuler(): string {
    if (this.storage.isClient()) {
      return '/client/mes-commandes';
    } else if (this.storage.isAdmin() || this.storage.hasRole('MANAGER') || this.storage.hasRole('EMPLOYE')) {
      return '/admin/reservations';
    }
    return '/home'; // Fallback vers l'accueil
  }
  /**
   * Retourne la route de retour selon le rôle de l'utilisateur
   */
  getRouteRetour(id : number|undefined): string {
    if (this.storage.isClient()) {
      return '/client/reservation-details/'+id;
    } else if (this.storage.isAdmin() || this.storage.hasRole('MANAGER') || this.storage.hasRole('EMPLOYE')) {
      return '/admin/reservation-details/'+id;
    }
    return '/home'; // Fallback vers l'accueil
  }
}
