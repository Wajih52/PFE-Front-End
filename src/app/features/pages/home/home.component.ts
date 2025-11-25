// src/app/features/pages/home/home.component.ts

import {Component, OnInit, inject, PLATFORM_ID, afterNextRender, signal} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { PanierService } from '../../../services/panier.service';
import {NavbarComponent} from '../../../shared/navbar/navbar.component';
import {TypeReclamation} from '../../../core/models/reclamation.enums';
import {ReclamationService} from '../../../services/reclamation.service';
import {ReclamationRequest} from '../../../core/models/reclamation.model';
import {FormsModule} from '@angular/forms';
import {FooterComponent} from '../../../shared/footer/footer.component';
interface Service {
  icon: string;
  title: string;
  description: string;
}

interface FeaturedProduct {
  id: number;
  name: string;
  category: string;
  image: string;
  price: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FormsModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);
  private panierService = inject(PanierService);
  private platformId = inject(PLATFORM_ID);
  private reclamationService = inject(ReclamationService);

  totalPanier = this.panierService.totalArticles;

  isAuthenticated = false;
  userName: string | null = null;

  // Services proposés
  services: Service[] = [
    {
      icon: '💍',
      title: 'Mariages',
      description: 'Des célébrations inoubliables avec une décoration élégante et sur mesure'
    },
    {
      icon: '🎂',
      title: 'Anniversaires',
      description: 'Fêtez vos moments spéciaux avec style et créativité'
    },
    {
      icon: '💐',
      title: 'Fiançailles',
      description: 'Marquez le début de votre histoire avec une soirée romantique'
    },
    {
      icon: '🎪',
      title: 'Événements Professionnels',
      description: 'Des solutions complètes pour vos conférences et séminaires'
    }
  ];

  // Produits en vedette
  featuredProducts: FeaturedProduct[] = [
    {
      id: 1,
      name: 'Chaise Napoléon Transparente',
      category: 'Mobilier',
      image: 'assets/images/products/chair-napoleon.jpg',
      price: '3.5 TND'
    },
    {
      id: 2,
      name: 'Table Ronde Élégante',
      category: 'Mobilier',
      image: 'assets/images/products/table-round.jpg',
      price: '2 TND'
    },
    {
      id: 3,
      name: 'Décoration Florale Premium',
      category: 'Décoration',
      image: 'assets/images/products/decoration.jpg',
      price: '50 TND'
    },
    {
      id: 4,
      name: 'Éclairage Ambiance',
      category: 'Éclairage',
      image: 'assets/images/products/lighting.jpg',
      price: '25 TND'
    }
  ];

// Formulaire de contact/réclamation
  formData = {
    nom: '',
    email: '',
    telephone: '',
    message: '',
    typeReclamation: '' as TypeReclamation | '',
    objet: '' // N'apparaît que si type = AUTRE
  };

  // Signals
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  codeReclamation = signal<string | null>(null);

  // Types de réclamation pour le select
  typesReclamation = [
    { value: TypeReclamation.PRODUIT_ENDOMMAGE, label: 'Produit endommagé' },
    { value: TypeReclamation.QUANTITE_MANQUANTE, label: 'Quantité manquante' },
    { value: TypeReclamation.RETARD_LIVRAISON, label: 'Retard de livraison' },
    { value: TypeReclamation.QUALITE_SERVICE, label: 'Qualité du service' },
    { value: TypeReclamation.PRODUIT_NON_CONFORME, label: 'Produit non conforme' },
    { value: TypeReclamation.PROBLEME_RETOUR, label: 'Problème de retour' },
    { value: TypeReclamation.FACTURATION, label: 'Facturation' },
    { value: TypeReclamation.AUTRE, label: 'Autre' }
  ];


  constructor() {
    // ✅ AJOUTÉ : Vérifier l'authentification UNIQUEMENT côté client après le rendu
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.checkAuthentication();
      });
    }
  }
  ngOnInit(): void {

  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  private checkAuthentication(): void {
    const token = this.storage.getToken();
    this.isAuthenticated = !!token;

    if (this.isAuthenticated) {
      this.userName = this.storage.getUserName();
    }
  }




  /**
   * Navigation vers le catalogue
   */
  goToCatalogue(): void {
    this.router.navigate(['/catalogue']);
  }




  /**
   * Scroll vers une section spécifique
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Gestion des erreurs d'image
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-product.jpg';
  }

  /**
   * Vérifier si le champ objet doit être affiché
   */
  get showObjetField(): boolean {
    return this.formData.typeReclamation === TypeReclamation.AUTRE;
  }

  /**
   * Soumettre le formulaire (message simple ou réclamation)
   */
  onSubmit(): void {
    // Validation basique
    if (!this.formData.nom || !this.formData.email || !this.formData.telephone) {
      this.submitError.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Si un type de réclamation est sélectionné, créer une réclamation
    if (this.formData.typeReclamation) {
      this.submitReclamation();
    } else {
      // Sinon, c'est un simple message de contact
      this.submitContactMessage();
    }
  }

  /**
   * Soumettre une réclamation
   */
  private submitReclamation(): void {
    // Validation spécifique réclamation
    if (!this.formData.message) {
      this.submitError.set('Veuillez décrire votre réclamation');
      return;
    }

    if (this.formData.typeReclamation === TypeReclamation.AUTRE && !this.formData.objet) {
      this.submitError.set('Veuillez préciser l\'objet de votre réclamation');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const request: ReclamationRequest = {
      objet: this.formData.objet || this.typesReclamation.find(t => t.value === this.formData.typeReclamation)?.label || 'Réclamation',
      descriptionReclamation: this.formData.message,
      contactEmail: this.formData.email,
      contactTelephone: this.formData.telephone,
      typeReclamation: this.formData.typeReclamation as TypeReclamation
    };

    this.reclamationService.creerReclamation(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.codeReclamation.set(response.codeReclamation);
        this.resetForm();

        // Cacher le message après 10 secondes
        setTimeout(() => {
          this.submitSuccess.set(false);
          this.codeReclamation.set(null);
        }, 10000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitError.set(error.error?.message || 'Une erreur est survenue');
        console.error('Erreur réclamation:', error);
      }
    });
  }

  /**
   * Soumettre un simple message de contact
   */
  private submitContactMessage(): void {
    if (!this.formData.message) {
      this.submitError.set('Veuillez saisir votre message');
      return;
    }

    // TODO: Implémenter l'envoi d'email de contact
    console.log('Message de contact:', this.formData);

    this.submitSuccess.set(true);
    this.resetForm();

    setTimeout(() => {
      this.submitSuccess.set(false);
    }, 5000);
  }

  /**
   * Réinitialiser le formulaire
   */
  private resetForm(): void {
    this.formData = {
      nom: '',
      email: '',
      telephone: '',
      message: '',
      typeReclamation: '',
      objet: ''
    };
  }

  /**
   * Fermer le message de succès
   */
  closeSuccess(): void {
    this.submitSuccess.set(false);
    this.codeReclamation.set(null);
  }

  /**
   * Fermer le message d'erreur
   */
  closeError(): void {
    this.submitError.set(null);
  }
}
