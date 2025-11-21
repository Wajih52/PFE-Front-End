// src/app/features/admin/pages/livraison-detail/livraison-detail.component.ts
// 🚚 Composant ADMIN/EMPLOYE - Détails d'une livraison

import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {LivraisonService} from '../../../../services/livraison.service';
import {UtilisateurService} from '../../../../services/utilisateur.service';
import {
  AffectationLivraisonRequestDto,
  canMarquerEnCours,
  canMarquerLivree,
  canModifierLivraison,
  formatDateHeureLivraison,
  LivraisonResponseDto,
  StatutLivraisonColors,
  StatutLivraisonLabels
} from '../../../../core/models/livraison.model';
import {StatutLivraison} from '../../../../core/models/reservation.model';
import {StatutCompte, UserResponse} from '../../../../core/models';

@Component({
  selector: 'app-livraison-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './livraison-detail.component.html',
  styleUrls: ['./livraison-detail.component.scss']
})
export class LivraisonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private livraisonService = inject(LivraisonService);
  private utilisateurService = inject(UtilisateurService);
  private fb = inject(FormBuilder);

  // Données
  livraison = signal<LivraisonResponseDto | null>(null);
  employes = signal<UserResponse[]>([]);

  // États
  isLoading = signal<boolean>(true);
  actionEnCours = signal<string | null>(null);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Modal d'affectation
  showAffectationModal = signal<boolean>(false);
  affectationForm!: FormGroup;
  submittedAffectation = signal<boolean>(false);

  // Labels
  readonly statutLabels = StatutLivraisonLabels;
  readonly statutColors = StatutLivraisonColors;

  // Fonctions utilitaires
  canModifier = canModifierLivraison;
  canMarquerEnCoursFunc = canMarquerEnCours;
  canMarquerLivreeFunc = canMarquerLivree;
  formatDateHeure = formatDateHeureLivraison;

  ngOnInit(): void {
    this.initAffectationForm();
    this.chargerLivraison();
    this.chargerEmployes();
  }

  /**
   * Initialiser le formulaire d'affectation
   */
  initAffectationForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.affectationForm = this.fb.group({
      idEmploye: ['', Validators.required],
      dateAffectation: [today, Validators.required],
      heureDebut: ['08:00', Validators.required],
      heureFin: ['17:00', Validators.required],
      notes: ['']
    });
  }

  /**
   * Charger la livraison
   */
  chargerLivraison(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage.set('ID de livraison invalide');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.livraisonService.getLivraisonById(id).subscribe({
      next: (data) => {
        this.livraison.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set('Impossible de charger la livraison.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Charger les employés
   */
  chargerEmployes(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (users) => {
        const employesFiltres = users.filter(u => {
          // ✅ roles est un string[], pas un UserRole[]
          const hasEmployeRole = u.roles.some(role =>
            role === 'EMPLOYE' ||
            role === 'MANAGER' ||
            role === 'ADMIN'
          );

          // ✅ etatCompte est un StatutCompte enum
          const isActif = u.etatCompte === StatutCompte.ACTIF;

          return isActif && hasEmployeRole;
        });

        this.employes.set(employesFiltres);
      }
    });
  }

  /**
   * Marquer la livraison en cours
   */
  marquerEnCours(): void {
    const livraison = this.livraison();
    if (!livraison || !this.canMarquerEnCoursFunc(livraison)) {
      return;
    }

    this.actionEnCours.set('marquer-en-cours');
    this.errorMessage.set('');
    this.successMessage.set('');

    this.livraisonService.marquerEnCours(livraison.idLivraison).subscribe({
      next: (updated) => {
        this.successMessage.set('Livraison marquée en cours !');
        this.livraison.set(updated);
        this.actionEnCours.set(null);

        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors du changement de statut.');
        this.actionEnCours.set(null);
      }
    });
  }

  /**
   * Marquer la livraison comme livrée
   */
  marquerLivree(): void {
    const livraison = this.livraison();
    if (!livraison || !this.canMarquerLivreeFunc(livraison)) {
      return;
    }

    this.actionEnCours.set('marquer-livree');
    this.errorMessage.set('');
    this.successMessage.set('');

    this.livraisonService.marquerLivree(livraison.idLivraison).subscribe({
      next: (updated) => {
        this.successMessage.set('Livraison marquée comme livrée !');
        this.livraison.set(updated);
        this.actionEnCours.set(null);

        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors du changement de statut.');
        this.actionEnCours.set(null);
      }
    });
  }

  /**
   * Télécharger le bon de livraison
   */
  telechargerBonLivraison(): void {
    const livraison = this.livraison();
    if (!livraison) return;

    this.livraisonService.downloadBonLivraison(
      livraison.idLivraison,
      livraison.titreLivraison
    );
  }

  /**
   * Ouvrir le modal d'affectation
   */
  ouvrirModalAffectation(): void {
    this.showAffectationModal.set(true);
    this.affectationForm.reset({
      idEmploye: '',
      dateAffectation: new Date().toISOString().split('T')[0],
      heureDebut: '08:00',
      heureFin: '17:00',
      notes: ''
    });
    this.submittedAffectation.set(false);
  }

  /**
   * Fermer le modal d'affectation
   */
  fermerModalAffectation(): void {
    this.showAffectationModal.set(false);
    this.submittedAffectation.set(false);
  }

  /**
   * Affecter un employé
   */
  affecterEmploye(): void {
    this.submittedAffectation.set(true);

    if (this.affectationForm.invalid) {
      return;
    }

    const livraison = this.livraison();
    if (!livraison) return;

    this.actionEnCours.set('affecter-employe');
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.affectationForm.value;

    const request: AffectationLivraisonRequestDto = {
      idLivraison: livraison.idLivraison,
      idEmploye: Number(formValue.idEmploye),
      dateAffectation: formValue.dateAffectation,
      heureDebut: this.livraisonService.formatTimeForApi(formValue.heureDebut),
      heureFin: this.livraisonService.formatTimeForApi(formValue.heureFin),
      notes: formValue.notes || undefined
    };

    this.livraisonService.affecterEmploye(request).subscribe({
      next: (affectation) => {
        this.successMessage.set('Employé affecté avec succès !');
        this.fermerModalAffectation();
        this.chargerLivraison(); // Recharger pour avoir les affectations à jour
        this.actionEnCours.set(null);

        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors de l\'affectation.');
        this.actionEnCours.set(null);
      }
    });
  }

  /**
   * Retirer une affectation
   */
  retirerAffectation(idAffectation: number): void {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette affectation ?')) {
      return;
    }

    this.actionEnCours.set(`retirer-${idAffectation}`);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.livraisonService.retirerEmploye(idAffectation).subscribe({
      next: () => {
        this.successMessage.set('Affectation retirée avec succès !');
        this.chargerLivraison();
        this.actionEnCours.set(null);

        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression.');
        this.actionEnCours.set(null);
      }
    });
  }

  /**
   * Retourner à la liste
   */
  retourListe(): void {
    this.router.navigate(['/admin/livraisons']);
  }

  /**
   * Obtenir la classe du badge de statut
   */
  getStatutBadgeClass(statut: StatutLivraison): string {
    return `badge bg-${this.statutColors[statut]}`;
  }

  /**
   * Vérifier si une action est en cours
   */
  isActionEnCours(action: string): boolean {
    return this.actionEnCours() === action;
  }

  /**
   * Getters pour le formulaire
   */
  get af() {
    return this.affectationForm.controls;
  }
}
