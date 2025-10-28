// src/app/features/admin/pages/instance-form/instance-form.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InstanceProduitService } from '../../../../services/instance-produit.service';
import { ProduitService } from '../../../../services/produit.service';
import {
  InstanceProduitRequest,
  InstanceProduitResponse,
  ProduitResponse,
  StatutInstance,
  StatutInstanceLabels
} from '../../../../core/models';
import { MenuNavigationComponent } from '../menu-navigation/menu-navigation.component';
import {NotificationComponent} from '../../../../shared/notification/notification.component';
import {NotificationService} from '../../../../services/notification.service';

/**
 * Composant de formulaire pour créer ou modifier une instance
 *
 */
@Component({
  selector: 'app-instance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MenuNavigationComponent, FormsModule],
  templateUrl: './instance-form.component.html',
  styleUrls: ['./instance-form.component.scss']
})
export class InstanceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private instanceService = inject(InstanceProduitService);
  private produitService = inject(ProduitService);
  private notificationService = inject(NotificationService);


  // Formulaire
  instanceForm!: FormGroup;
  isEditMode = false;
  instanceId: number | null = null;
  currentInstance: InstanceProduitResponse | null = null;

  // Données
  produitsAvecReference: ProduitResponse[] = [];
  selectedProduit: ProduitResponse | null = null;

  // États
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Enums pour le template
  StatutInstance = StatutInstance;
  StatutInstanceLabels = StatutInstanceLabels;
  statutsList = Object.values(StatutInstance);

  // Options de création en lot
  showBatchCreation = false;
  batchQuantity = 1;
  batchPrefix = 'Ce Champ est géneré automatiquement';

  ngOnInit(): void {
    this.initForm();
    this.loadProduitsAvecReference();
    this.checkEditMode();
  }

  /**
   * Initialise le formulaire
   */
  initForm(): void {
    this.instanceForm = this.fb.group({
      idProduit: ['', Validators.required],
      numeroSerie: [''], // Auto-généré si vide
      statut: [StatutInstance.DISPONIBLE, Validators.required],
      observation: ['']
    });

    // Récupérer l'ID du produit depuis les paramètres de l'URL si présent
    this.route.queryParams.subscribe(params => {
      if (params['idProduit']) {
        this.instanceForm.patchValue({ idProduit: +params['idProduit'] });
        this.onProduitChange();
      }
    });
  }

  /**
   * Charge les produits avec référence
   */
  loadProduitsAvecReference(): void {
    this.produitService.getAllProduits().subscribe({
      next: (produits) => {
        // Filtrer uniquement les produits avec référence
        this.produitsAvecReference = produits.filter(p => p.typeProduit === 'avecReference');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.errorMessage = 'Erreur lors du chargement des produits';
      }
    });
  }

  /**
   * Vérifie si on est en mode édition
   */
  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.instanceId = +id;
      this.loadInstance();
    }
  }

  /**
   * Charge l'instance à modifier
   */
  loadInstance(): void {
    if (!this.instanceId) return;

    this.isLoading = true;
    this.instanceService.getInstanceById(this.instanceId).subscribe({
      next: (instance) => {
        this.currentInstance = instance;
        this.instanceForm.patchValue({
          idProduit: instance.idProduit,
          numeroSerie: instance.numeroSerie,
          statut: instance.statut,
          observation: instance.observation
        });
        this.onProduitChange();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'instance:', error);
        this.errorMessage = 'Instance introuvable';
        this.isLoading = false;
      }
    });
  }

  /**
   * Gère le changement de produit sélectionné
   */
  onProduitChange(): void {
    const idProduit = this.instanceForm.get('idProduit')?.value;
    if (idProduit) {
      this.selectedProduit = this.produitsAvecReference.find(p => p.idProduit === +idProduit) || null;
    } else {
      this.selectedProduit = null;
    }
  }

  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.instanceForm.invalid) {
      this.markFormGroupTouched(this.instanceForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData: InstanceProduitRequest = {
      idProduit: +this.instanceForm.value.idProduit,
      numeroSerie: this.instanceForm.value.numeroSerie || undefined,
      statut: this.instanceForm.value.statut,
      observation: this.instanceForm.value.observation || undefined
    };

    const operation = this.isEditMode && this.instanceId
      ? this.instanceService.modifierInstance(this.instanceId, formData)
      : this.instanceService.creerInstance(formData);

    operation.subscribe({
      next: (instance) => {
       const message = this.isEditMode
         ? `Instance modifiée avec succès !`
         : `Instance créée avec succès !`;

        this.notificationService.success(message);
        this.isSubmitting = false;

        setTimeout(() => {
        this.router.navigate(['/admin/instances'], {
          queryParams: { idProduit: instance.idProduit }
        });
        }, 2500);

      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isSubmitting = false;
        this.notificationService.error(error.error?.message||'Erreur lors de l\'enregistrement');
      }
    });
  }

  /**
   * Création en lot
   */
  onBatchCreate(): void {
    if (!this.selectedProduit || this.batchQuantity < 1) {
      this.notificationService.info('Veuillez sélectionner un produit et une quantité valide')
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.instanceService.creerInstancesEnLot(
      this.selectedProduit.idProduit,
      this.batchQuantity,
      this.batchPrefix
    ).subscribe({
      next: (instances) => {
        this.notificationService.success(` ${instances.length} instances créées avec succès !`);
        this.router.navigate(['/admin/instances'], {
          queryParams: { idProduit: this.selectedProduit!.idProduit }
        });
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isSubmitting = false;
        this.notificationService.error(error.error?.message || 'Erreur lors de la création en lot')
      }
    });
  }

  /**
   * Annule et retourne à la liste
   */
  onCancel(): void {
    if (this.selectedProduit) {
      this.router.navigate(['/admin/instances'], {
        queryParams: { idProduit: this.selectedProduit.idProduit }
      });
    } else {
      this.router.navigate(['/admin/instances']);
    }
  }

  /**
   * Marque tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifie si un champ a une erreur et a été touché
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.instanceForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  /**
   * Toggle du mode création en lot
   */
  toggleBatchMode(): void {
    this.showBatchCreation = !this.showBatchCreation;
  }

    protected readonly Math = Math;
}
