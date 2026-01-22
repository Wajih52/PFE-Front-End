// nouvelle-reclamation.component.ts - Pour utilisateurs connectés
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamationService } from '../../../services/reclamation.service';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { TypeReclamation } from '../../../core/models/reclamation.enums';
import { ReclamationRequest } from '../../../core/models/reclamation.model';

@Component({
  selector: 'app-nouvelle-reclamation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nouvelle-reclamation.component.html',
  styleUrl: './nouvelle-reclamation.component.scss'
})
export class NouvelleReclamationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reclamationService = inject(ReclamationService);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);

  // Form
  reclamationForm!: FormGroup;

  // Signals
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  codeReclamation = signal<string | null>(null);
  mesReservations = signal<any[]>([]);
  isLoadingReservations = signal(false);
  currentUserEmail = signal<string | null>(null);

  // Types de réclamation
  typesReclamation = [
    { value: TypeReclamation.PRODUIT_ENDOMMAGE, label: 'Produit endommagé', icon: 'build' },
    { value: TypeReclamation.QUANTITE_MANQUANTE, label: 'Quantité manquante', icon: 'package_2' },
    { value: TypeReclamation.RETARD_LIVRAISON, label: 'Retard de livraison', icon: 'timer' },
    { value: TypeReclamation.QUALITE_SERVICE, label: 'Qualité du service', icon: 'star' },
    { value: TypeReclamation.PRODUIT_NON_CONFORME, label: 'Produit non conforme', icon: 'close' },
    { value: TypeReclamation.PROBLEME_RETOUR, label: 'Problème de retour', icon: 'undo' },
    { value: TypeReclamation.FACTURATION, label: 'Facturation', icon: 'payments' },
    { value: TypeReclamation.AUTRE, label: 'Autre', icon: 'assignment' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadUserInfo();
    this.loadMesReservations();
  }

  /**
   * Initialiser le formulaire
   */
  private initForm(): void {
    this.reclamationForm = this.fb.group({
      typeReclamation: ['', Validators.required],
      objet: [''], // Conditionnel (requis si type = AUTRE)
      descriptionReclamation: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactTelephone: ['', [Validators.pattern(/^[0-9]{8}$/)]],
      idReservation: [null] // Optionnel
    });

    // Watcher pour afficher/cacher le champ objet
    this.reclamationForm.get('typeReclamation')?.valueChanges.subscribe(value => {
      const objetControl = this.reclamationForm.get('objet');
      if (value === TypeReclamation.AUTRE) {
        objetControl?.setValidators([Validators.required, Validators.maxLength(200)]);
      } else {
        objetControl?.clearValidators();
        objetControl?.setValue('');
      }
      objetControl?.updateValueAndValidity();
    });
  }

  /**
   * Charger les infos de l'utilisateur connecté
   */
  private loadUserInfo(): void {
    const user = this.authService.getCurrentUser(); // À adapter selon votre service
    if (user) {
      this.currentUserEmail.set(user.email);
      this.reclamationForm.patchValue({
        contactEmail: user.email,
        contactTelephone: user.telephone || ''
      });
    }
  }

  /**
   * Charger les réservations de l'utilisateur
   */
  private loadMesReservations(): void {
    this.isLoadingReservations.set(true);

    // À adapter selon votre service de réservations
    this.reservationService.getMesReservations().subscribe({
      next: (reservations) => {
        // Filtrer uniquement les réservations confirmées/en cours
        const reservationsValides = reservations.filter((r: any) =>
          ['EN_ATTENTE','EN_COURS', 'LIVREE','RETOUR','RETOUR_PARTIEL','RETOURNEE'].includes(r.statutLivraisonRes)
        );
        this.mesReservations.set(reservationsValides);
        this.isLoadingReservations.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement réservations:', err);
        this.isLoadingReservations.set(false);
      }
    });
  }

  /**
   * Vérifier si le champ objet doit être affiché
   */
  get showObjetField(): boolean {
    return this.reclamationForm.get('typeReclamation')?.value === TypeReclamation.AUTRE;
  }

  /**
   * Obtenir l'icône du type sélectionné
   */
  get selectedTypeIcon(): string {
    const type = this.reclamationForm.get('typeReclamation')?.value;
    return this.typesReclamation.find(t => t.value === type)?.icon || 'assignment';
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.reclamationForm.invalid) {
      this.markFormGroupTouched(this.reclamationForm);
      this.submitError.set('Veuillez remplir tous les champs obligatoires correctement');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.reclamationForm.value;

    // Construire l'objet si pas de type AUTRE
    let objetFinal = formValue.objet;
    if (formValue.typeReclamation !== TypeReclamation.AUTRE) {
      const typeLabel = this.typesReclamation.find(t => t.value === formValue.typeReclamation)?.label;
      objetFinal = typeLabel || 'Réclamation';
    }

    const request: ReclamationRequest = {
      objet: objetFinal,
      descriptionReclamation: formValue.descriptionReclamation,
      contactEmail: formValue.contactEmail,
      contactTelephone: formValue.contactTelephone || undefined,
      typeReclamation: formValue.typeReclamation,
      idReservation: formValue.idReservation || undefined
    };

    this.reclamationService.creerReclamation(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.codeReclamation.set(response.codeReclamation);
        this.reclamationForm.reset();

        // Rediriger après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/reclamations/mes-reclamations']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitError.set(error.error?.message || 'Une erreur est survenue lors de la création de la réclamation');
        console.error('Erreur réclamation:', error);

        // Scroller vers le haut pour voir l'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /**
   * Marquer tous les champs comme touchés (pour afficher les erreurs)
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifier si un champ est invalide et touché
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.reclamationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtenir le message d'erreur d'un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.reclamationForm.get(fieldName);
    if (!field?.errors) return '';

    if (field.errors['required']) return 'Ce champ est obligatoire';
    if (field.errors['email']) return 'Email invalide';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
    if (field.errors['pattern']) return 'Format invalide (8 chiffres)';

    return 'Champ invalide';
  }

  /**
   * Annuler et retourner
   */
  onCancel(): void {
    this.router.navigate(['/reclamations/mes-reclamations']);
  }

  /**
   * Fermer le message de succès
   */
  closeSuccess(): void {
    this.submitSuccess.set(false);
    this.router.navigate(['/reclamations/mes-reclamations']);
  }

  /**
   * Fermer le message d'erreur
   */
  closeError(): void {
    this.submitError.set(null);
  }
}
