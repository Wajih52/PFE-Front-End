// src/app/features/admin/pages/livraison-create/livraison-create.component.ts
// 🚚 Composant ADMIN/EMPLOYE - Créer une nouvelle livraison
// VERSION CORRIGÉE : referenceReservation depuis la réservation parent

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LivraisonService } from '../../../../services/livraison.service';
import { ReservationService } from '../../../../services/reservation.service';
import { LivraisonRequestDto } from '../../../../core/models/livraison.model';
import {
  ReservationResponseDto,
  LigneReservationResponseDto
} from '../../../../core/models/reservation.model';
import {NotificationPersistantService} from '../../../../services/notification-persistant.service';

/**
 * Interface étendue pour ajouter la référence de réservation aux lignes
 */
interface LigneAvecReference extends LigneReservationResponseDto {
  referenceReservation: string; // Ajouté depuis la réservation parente
}

@Component({
  selector: 'app-livraison-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './livraison-create.component.html',
  styleUrls: ['./livraison-create.component.scss']
})
export class LivraisonCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private livraisonService = inject(LivraisonService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private notificationPersist = inject(NotificationPersistantService)

  // Formulaire
  livraisonForm!: FormGroup;
  submitted = signal<boolean>(false);

  // Données
  reservations = signal<ReservationResponseDto[]>([]);

  // ✅ CORRECTION : Computed signal qui enrichit les lignes avec referenceReservation
  lignesDisponibles = computed<LigneAvecReference[]>(() => {
    return this.reservations()
      .filter(r => r.statutReservation === 'CONFIRME')
      .flatMap(reservation => {
        // Pour chaque ligne, ajouter la référence de la réservation parente
        return (reservation.lignesReservation || [])
          .filter(ligne => !ligne.idLivraison) // Lignes sans livraison assignée
          .map(ligne => ({
            ...ligne,
            referenceReservation: reservation.referenceReservation // ✅ Ajouté ici
          }));
      });
  });

  // Sélection
  lignesSelectionnees = signal<Set<number>>(new Set());

  // États
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Filtres pour les lignes
  filtreReservation = signal<string>('');
  filtreProduit = signal<string>('');

  ngOnInit(): void {
    this.initForm();
    this.chargerReservations();
  }

  /**
   * Initialiser le formulaire
   */
  initForm(): void {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    this.livraisonForm = this.fb.group({
      titreLivraison: ['', [Validators.required, Validators.minLength(3)]],
      adresseLivraison: ['', [Validators.required, Validators.minLength(5)]],
      dateLivraison: [todayStr, Validators.required],
      heureLivraison: ['10:00', Validators.required],
      observations: ['']
    });
  }

  /**
   * Charger les réservations
   */
  chargerReservations(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set('Impossible de charger les réservations.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Toggle sélection d'une ligne
   */
  toggleLigneSelection(idLigne: number): void {
    const selection = new Set(this.lignesSelectionnees());

    if (selection.has(idLigne)) {
      selection.delete(idLigne);
    } else {
      selection.add(idLigne);
    }

    this.lignesSelectionnees.set(selection);
  }

  /**
   * Vérifier si une ligne est sélectionnée
   */
  isLigneSelectionnee(idLigne: number): boolean {
    return this.lignesSelectionnees().has(idLigne);
  }

  /**
   * Sélectionner toutes les lignes visibles
   */
  selectionnerToutesLignes(): void {
    const lignesFiltrees = this.getLignesFiltrees();
    const selection = new Set(this.lignesSelectionnees());

    lignesFiltrees.forEach(ligne => selection.add(ligne.idLigneReservation));
    this.lignesSelectionnees.set(selection);
  }

  /**
   * Désélectionner toutes les lignes
   */
  deselectionnerToutesLignes(): void {
    this.lignesSelectionnees.set(new Set());
  }

  /**
   *  Obtenir les lignes filtrées
   */
  getLignesFiltrees(): LigneAvecReference[] {
    let lignes = this.lignesDisponibles();

    // Filtre par référence réservation
    if (this.filtreReservation()) {
      const recherche = this.filtreReservation().toLowerCase();
      lignes = lignes.filter(l =>
        l.referenceReservation.toLowerCase().includes(recherche)
      );
    }

    // Filtre par nom produit
    if (this.filtreProduit()) {
      const recherche = this.filtreProduit().toLowerCase();
      lignes = lignes.filter(l =>
        l.nomProduit.toLowerCase().includes(recherche)
      );
    }

    return lignes;
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    this.submitted.set(true);

    // Validation du formulaire
    if (this.livraisonForm.invalid) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Validation de la sélection
    if (this.lignesSelectionnees().size === 0) {
      this.errorMessage.set('Veuillez sélectionner au moins une ligne de réservation.');
      return;
    }

    this.creerLivraison();
  }

  /**
   * Créer la livraison
   */
  creerLivraison(): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.livraisonForm.value;

    const request: LivraisonRequestDto = {
      titreLivraison: formValue.titreLivraison,
      adresseLivraison: formValue.adresseLivraison,
      dateLivraison: formValue.dateLivraison,
      heureLivraison: this.livraisonService.formatTimeForApi(formValue.heureLivraison),
      idLignesReservation: Array.from(this.lignesSelectionnees()),
      observations: formValue.observations || undefined
    };

    this.livraisonService.creerLivraison(request).subscribe({
      next: (livraison) => {
        this.successMessage.set('Livraison créée avec succès !');
        this.notificationPersist.refreshCount();
        // Rediriger vers les détails après 1 seconde
        setTimeout(() => {
          this.router.navigate(['/admin/livraisons', livraison.idLivraison]);
        }, 1000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(
          error.error?.message || 'Erreur lors de la création de la livraison.'
        );
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Annuler et retourner à la liste
   */
  annuler(): void {
    this.router.navigate(['/admin/livraisons']);
  }

  /**
   * Getters pour le formulaire
   */
  get f() {
    return this.livraisonForm.controls;
  }

  /**
   * Nombre de lignes sélectionnées
   */
  getNombreLignesSelectionnees(): number {
    return this.lignesSelectionnees().size;
  }

  /**
   * Nombre total de lignes disponibles
   */
  getNombreLignesDisponibles(): number {
    return this.lignesDisponibles().length;
  }
}
