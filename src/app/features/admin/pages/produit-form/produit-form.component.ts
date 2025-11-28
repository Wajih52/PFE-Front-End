// src/app/features/admin/pages/produit-form/produit-form.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProduitService } from '../../../../services/produit.service';
import { ImageService } from '../../../../core/services/image.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import {
  ProduitRequest,
  ProduitResponse,
  Categorie,
  TypeProduit,
  CategorieLabels,
  TypeProduitLabels
} from '../../../../core/models';
import {MenuNavigationComponent} from '../menu-navigation/menu-navigation.component';
import {ScrollService} from '../../../../services/scroll.service';

/**
 * Composant de formulaire pour créer ou modifier un produit
 *
 */
@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MenuNavigationComponent],
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-form.component.scss']
})
export class ProduitFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private produitService = inject(ProduitService);
  private imageService = inject(ImageService);
  private confirmationService = inject(ConfirmationService);
  private scrollService =inject(ScrollService);

  // Formulaire
  produitForm!: FormGroup;

  // Données
  produitId: number | null = null;
  produit: ProduitResponse | null = null;
  previewImage: string = '';

  // UI
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  isLoadingImage = false;
  errorMessage = '';
  successMessage = '';

  // Enums pour le template
  readonly Categorie = Categorie;
  readonly TypeProduit = TypeProduit;
  readonly CategorieLabels = CategorieLabels;
  readonly TypeProduitLabels = TypeProduitLabels;
  readonly categoriesList = Object.values(Categorie);
  readonly typesList = Object.values(TypeProduit);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  /**
   * Initialiser le formulaire avec validations
   */
  initForm(): void {
    this.produitForm = this.fb.group({
      nomProduit: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descriptionProduit: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      categorieProduit: ['', Validators.required],
      prixUnitaire: ['', [Validators.required, Validators.min(0.01)]],
      quantiteInitial: ['', [Validators.required, Validators.min(0)]],
      typeProduit: ['', Validators.required],
      maintenanceRequise: [false],
      imageProduit: [''],
      seuilCritique: [null, [Validators.min(0)]]
    });

    // Écouter le changement de type de produit
    this.produitForm.get('typeProduit')?.valueChanges.subscribe(type => {
      this.onTypeProduitChange(type);
    });
  }

  /**
   * Vérifier si on est en mode édition
   */
  checkEditMode(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.produitId = +id;
        this.isEditMode = true;
        this.loadProduit(this.produitId);
      }
    });
  }

  /**
   * Charger les données du produit (mode édition)
   */
  loadProduit(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.produitService.getProduitById(id).subscribe({
      next: (data) => {
        this.produit = data;
        this.populateForm(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du chargement du produit';
        this.isLoading = false;
      }
    });
  }

  /**
   * Remplir le formulaire avec les données du produit
   */
  populateForm(produit: ProduitResponse): void {
    this.produitForm.patchValue({
      nomProduit: produit.nomProduit,
      descriptionProduit: produit.descriptionProduit,
      categorieProduit: produit.categorieProduit,
      prixUnitaire: produit.prixUnitaire,
      quantiteInitial: produit.quantiteInitial,
      typeProduit: produit.typeProduit,
      maintenanceRequise: produit.maintenanceRequise,
      seuilCritique: produit.seuilCritique ?? null
    });

    // Afficher l'image si elle existe
    if (produit.imageProduit) {
      this.previewImage = `http://localhost:8080${produit.imageProduit}`;
    }
  }

  /**
   * Gérer le changement de type de produit
   */
  onTypeProduitChange(type: TypeProduit): void {
    const quantiteControl = this.produitForm.get('quantiteInitial');

    if (type === TypeProduit.AVEC_REFERENCE) {
      // Pour les produits avec référence, la quantité initiale n'est pas importante
      // (on gérera les instances séparément)
      quantiteControl?.clearValidators();
      quantiteControl?.setValue(0);
      quantiteControl?.disable();
    } else {
      // Pour les produits sans référence, la quantité est requise
      quantiteControl?.setValidators([Validators.required, Validators.min(0)]);
      quantiteControl?.enable();
    }
    quantiteControl?.updateValueAndValidity();
  }

  /**
   * Sélectionner une image
   */
  async onFileSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = '❌ Veuillez sélectionner une image valide';
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = '❌ Image trop volumineuse (max 5MB)';
      return;
    }

    try {
      this.isLoadingImage = true;
      this.errorMessage = '';

      // Compresser et obtenir le Base64
      const base64 = await this.imageService.compressImage(file);

      // Mettre à jour le formulaire et la prévisualisation
      this.produitForm.patchValue({ imageProduit: base64 });
      this.previewImage = base64;

      this.isLoadingImage = false;
    } catch (error) {
      console.error('Erreur compression image:', error);
      this.errorMessage = '❌ Erreur lors du traitement de l\'image';
      this.isLoadingImage = false;
    }
  }

  /**
   * Supprimer l'image
   */
  removeImage(): void {
    this.produitForm.patchValue({ imageProduit: '' });
    this.previewImage = '';
  }

  /**
   * Soumettre le formulaire
   */
  async onSubmit(): Promise<void> {
    // Valider le formulaire
    if (this.produitForm.invalid) {
      Object.keys(this.produitForm.controls).forEach(key => {
        const control = this.produitForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.errorMessage = '⚠️ Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    // Confirmer la soumission
    const action = this.isEditMode ? 'modifier' : 'créer';
    const confirmed = await this.confirmationService.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} le produit`,
      message: `Voulez-vous vraiment ${action} ce produit ?`,
      confirmText: `Oui, ${action}`,
      type: 'info'
    });

    if (!confirmed) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données
    const formValue = this.produitForm.getRawValue(); // getRawValue() pour inclure les champs désactivés
    const produitData: ProduitRequest = {
      nomProduit: formValue.nomProduit,
      descriptionProduit: formValue.descriptionProduit,
      categorieProduit: formValue.categorieProduit,
      prixUnitaire: formValue.prixUnitaire,
      quantiteInitial: formValue.quantiteInitial || 0,
      typeProduit: formValue.typeProduit,
      maintenanceRequise: formValue.maintenanceRequise || false,
      imageProduit: formValue.imageProduit || undefined,
      seuilCritique: formValue.seuilCritique ?? undefined
    };

    // Appeler le service
    const request$ = this.isEditMode
      ? this.produitService.modifierProduit(this.produitId!, produitData)
      : this.produitService.creerProduit(produitData);

    request$.subscribe({
      next: (response) => {
        this.successMessage = `✅ Produit ${this.isEditMode ? 'modifié' : 'créé'} avec succès !`;
        this.isSubmitting = false;
        setTimeout(() => {
          this.scrollService.scrollToTop();
        }, 100);
        // Rediriger après 1.5 secondes
        setTimeout(() => {
          if (this.isEditMode) {
            this.router.navigate(['/admin/produits']);
          } else {
            // Si création et type AVEC_REFERENCE, proposer de créer des instances
            if (response.typeProduit === TypeProduit.AVEC_REFERENCE) {
              this.confirmGoToInstances(response.idProduit);
            } else {
              this.router.navigate(['/admin/produits']);
            }
          }
        }, 1500);
      },
      error: (error) => {
        console.error('Erreur soumission:', error);
        this.errorMessage = error.error?.message || `Erreur lors de ${action}`;
        this.isSubmitting = false;

        // Afficher les erreurs de validation du backend
        if (error.error?.errors) {
          const backendErrors = Object.values(error.error.errors).join(', ');
          this.errorMessage += ` : ${backendErrors}`;
        }
        setTimeout(() => {
          this.scrollService.scrollToFirstError();
        }, 100);
      }
    });
  }

  /**
   * Proposer de créer des instances après création d'un produit AVEC_REFERENCE
   */
  async confirmGoToInstances(produitId: number): Promise<void> {
    const goToInstances = await this.confirmationService.confirm({
      title: '🎯 Créer des instances ?',
      message: 'Ce produit nécessite des instances (numéros de série). Voulez-vous les créer maintenant ?',
      confirmText: 'Oui, créer des instances',
      cancelText: 'Non, plus tard',
      type: 'info'
    });

    if (goToInstances) {
      this.router.navigate(['/admin/instances/new'], {
        queryParams: { idProduit: produitId }
      });
    } else {
      this.router.navigate(['/admin/produits']);
    }
  }

  /**
   * Annuler et retourner à la liste
   */
  async onCancel(): Promise<void> {
    // Si le formulaire a été modifié, demander confirmation
    if (this.produitForm.dirty) {
      const confirmed = await this.confirmationService.confirm({
        title: 'Annuler les modifications',
        message: 'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?',
        confirmText: 'Oui, quitter',
        type: 'warning'
      });

      if (!confirmed) return;
    }

    this.router.navigate(['/admin/produits']);
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.produitForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field?.touched || field?.dirty));
  }

  /**
   * Obtenir le message d'erreur d'un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.produitForm.get(fieldName);
    if (!field?.errors || (!field.touched && !field.dirty)) return '';

    const errors = field.errors;

    if (errors['required']) return 'Ce champ est requis';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `Valeur minimum : ${errors['min'].min}`;
    if (errors['max']) return `Valeur maximum : ${errors['max'].max}`;
    if (errors['email']) return 'Email invalide';

    return 'Champ invalide';
  }

  /**
   * Obtenir le titre de la page
   */
  get pageTitle(): string {
    return this.isEditMode ? '✏️ Modifier le produit' : '➕ Créer un nouveau produit';
  }

  /**
   * Obtenir le texte du bouton submit
   */
  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? 'Modification...' : 'Création...';
    }
    return this.isEditMode ? 'Modifier le produit' : 'Créer le produit';
  }
}
