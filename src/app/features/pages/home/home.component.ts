// src/app/features/pages/home/home.component.ts

import {Component, OnInit, inject, PLATFORM_ID, afterNextRender, signal, OnDestroy} from '@angular/core';
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
  image: string;
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
export class HomeComponent implements OnInit,OnDestroy{
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
      description: 'Des célébrations inoubliables avec une décoration élégante et sur mesure',
      image:'assets/images/image-mariage.jpg'
    },
    {
      icon: '🎂',
      title: 'Anniversaires',
      description: 'Fêtez vos moments spéciaux avec style et créativité',
      image:'assets/images/image-anniversaire.jpg'
    },
    {
      icon: '💐',
      title: 'Fiançailles',
      description: 'Marquez le début de votre histoire avec une soirée romantique',
      image:'assets/images/image-fiancaille.jpg'
    },
    {
      icon: '🎪',
      title: 'Événements Professionnels',
      description: 'Des solutions complètes pour vos conférences et séminaires',
      image:'assets/images/image-seminaire.jpg'
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
      image: 'assets/images/table-basse-ronde-plexiglass-transparent.jpg',
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

  // Propriétés pour le carrousel Hero
  heroImages = [
    'assets/images/mariage.jpg',
    'assets/images/mariage-2.jpg',
    'assets/images/mariage-3.jpg',
    'assets/images/hero-wedding.jpg'
  ];
  currentHeroIndex = 0;
  private heroCarouselInterval: any;

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

  // Erreurs par champ
  fieldErrors = {
    nom: signal<string>(''),
    email: signal<string>(''),
    telephone: signal<string>(''),
    message: signal<string>(''),
    objet: signal<string>('')
  };


  constructor() {
    //  Vérifier l'authentification UNIQUEMENT côté client après le rendu
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.checkAuthentication();
      });
    }
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthentication();
      this.startHeroCarousel();
    }
  }
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.stopHeroCarousel();
    }
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
    this.router.navigate(['/client/catalogue']);
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
   * Valider un champ spécifique
   */
  validateField(fieldName: keyof typeof this.formData): void {
    const value = this.formData[fieldName];

    switch(fieldName) {
      case 'nom':
        if (!value) {
          this.fieldErrors.nom.set('Le nom est obligatoire');
        } else if (value.length < 2) {
          this.fieldErrors.nom.set('Le nom doit contenir au moins 2 caractères');
        } else {
          this.fieldErrors.nom.set('');
        }
        break;

      case 'email':
        if (!value) {
          this.fieldErrors.email.set('L\'email est obligatoire');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          this.fieldErrors.email.set('Format d\'email invalide');
        } else {
          this.fieldErrors.email.set('');
        }
        break;

      case 'telephone':
        if (!value) {
          this.fieldErrors.telephone.set('Le téléphone est obligatoire');
        } else if (!/^\d{8}$/.test(value)) {
          this.fieldErrors.telephone.set('Le téléphone doit contenir exactement 8 chiffres');
        } else {
          this.fieldErrors.telephone.set('');
        }
        break;

      case 'message':
        if (!value) {
          this.fieldErrors.message.set('Le message est obligatoire');
        } else if (value.length < 10) {
          this.fieldErrors.message.set('Le message doit contenir au moins 10 caractères');
        } else {
          this.fieldErrors.message.set('');
        }
        break;

      case 'objet':
        if (this.formData.typeReclamation === TypeReclamation.AUTRE && !value) {
          this.fieldErrors.objet.set('L\'objet est obligatoire pour le type "Autre"');
        } else {
          this.fieldErrors.objet.set('');
        }
        break;
    }
  }

  /**
   * Valider tous les champs
   */
  validateAllFields(): boolean {
    this.validateField('nom');
    this.validateField('email');
    this.validateField('telephone');
    this.validateField('message');

    if (this.formData.typeReclamation === TypeReclamation.AUTRE) {
      this.validateField('objet');
    }

    return !this.fieldErrors.nom() &&
      !this.fieldErrors.email() &&
      !this.fieldErrors.telephone() &&
      !this.fieldErrors.message() &&
      (this.formData.typeReclamation !== TypeReclamation.AUTRE || !this.fieldErrors.objet());
  }


  /**
   * Soumettre le formulaire (message simple ou réclamation)
   */
  onSubmit(): void {
    // Valider tous les champs
    if (!this.validateAllFields()) {
      return;
    }
    // Réinitialiser l'erreur globale
    this.submitError.set(null);

    this.submitReclamation();

    // // Si un type de réclamation est sélectionné, créer une réclamation
    // if (this.formData.typeReclamation) {
    //   this.submitReclamation();
    // } else {
    //   // Sinon, c'est un simple message de contact
    //   this.submitContactMessage();
    // }
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
      typeReclamation: this.formData.typeReclamation as TypeReclamation || 'AUTRE'
    };

    this.reclamationService.creerReclamation(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.codeReclamation.set(response.codeReclamation);
        this.resetForm();

        // Cacher le message après 10 secondes
        setTimeout(() => {
         // this.submitSuccess.set(false);
          this.codeReclamation.set(null);
        }, 20000);
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

 // ============== animations imagess home =========================
  /**
   * Démarrer le carrousel automatique
   */
  private startHeroCarousel(): void {
    // Démarrer le changement d'images toutes les 5 secondes
    this.heroCarouselInterval = setInterval(() => {
      this.nextHeroSlide();
    }, 5000); // 5000ms = 5 secondes
  }

  /**
   * Arrêter le carrousel
   */
  private stopHeroCarousel(): void {
    if (this.heroCarouselInterval) {
      clearInterval(this.heroCarouselInterval);
    }
  }

  /**
   * Passer à la diapositive suivante
   */
  protected nextHeroSlide(): void {
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
  }

  /**
   * Passer à une diapositive spécifique (pour navigation manuelle)
   */
  goToHeroSlide(index: number): void {
    this.currentHeroIndex = index;
    // Redémarrer le timer après une interaction manuelle
    this.stopHeroCarousel();
    this.startHeroCarousel();
  }

  /**
   * Diapositive précédente
   */
  prevHeroSlide(): void {
    this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroImages.length) % this.heroImages.length;
    this.restartCarousel();
  }


  /**
   * Mettre en pause le carrousel au survol
   */
  pauseCarousel(): void {
    if (this.heroCarouselInterval) {
      clearInterval(this.heroCarouselInterval);
    }
  }

  /**
   * Reprendre le carrousel après le survol
   */
  resumeCarousel(): void {
    this.restartCarousel();
  }

  /**
   * Redémarrer le carrousel
   */
  private restartCarousel(): void {
    this.stopHeroCarousel();
    this.startHeroCarousel();
  }

}
