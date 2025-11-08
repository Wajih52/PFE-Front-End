// src/app/features/pages/catalogue-list/catalogue-list.component.ts
// VERSION CORRIGÉE - Utilise les APIs avec dates

import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {ProduitService} from '../../../services/produit.service';
import {PanierService} from '../../../services/panier.service';
import {Categorie, ProduitResponse} from '../../../core/models';

@Component({
  selector: 'app-catalogue-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalogue-list.component.html',
  styleUrls: ['./catalogue-list.component.scss']
})
export class CatalogueListComponent implements OnInit {
  private produitService = inject(ProduitService);
  private panierService = inject(PanierService);
  private router = inject(Router);

  // ============================================
  // 🎯 DATES DE LOCATION (CRITIQUES)
  // ============================================

  // ✅ Dates par défaut : Demain et après-demain
  dateDebutLocation: string = '';
  dateFinLocation: string = '';
  minDate: string;


  // ============================================
  // État du catalogue
  // ============================================

  produits = signal<ProduitResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  // Filtres
  categorieSelectionnee = signal<Categorie | null>(null);
  rechercheNom = signal<string>('');

  // Computed pour filtrer les produits côté client (en plus du filtrage serveur)
  produitsFiltres = computed(() => {
    let liste = this.produits();

    // Filtrer par nom si recherche active
    if (this.rechercheNom()) {
      const recherche = this.rechercheNom().toLowerCase();
      liste = liste.filter(p =>
        p.nomProduit.toLowerCase().includes(recherche) ||
        (p.descriptionProduit && p.descriptionProduit.toLowerCase().includes(recherche))
      );
    }

    return liste;
  });

  // Catégories disponibles
  categories: Categorie[] = [
  Categorie.LUMIERE,
  Categorie.MOBILIER,
    Categorie.DECORATION,
   Categorie.ACCESSOIRES,
    Categorie.STRUCTURE,
 Categorie.SONORISATION,
   Categorie.MATERIEL_RESTAURATION
  ];

  totalPanier = this.panierService.totalArticles;

  // Date minimale pour le sélecteur (aujourd'hui)
  dateMin = computed(() => this.formatDateForInput(new Date()));


  constructor() {
    this.minDate = this.formatDateForInput(new Date());
  }

  ngOnInit(): void {
    this.initialiserDatesParDefaut();
    this.chargerCatalogue();
  }

  /**
   * Initialiser les dates par défaut
   * Demain et après-demain
   */
  private initialiserDatesParDefaut(): void {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    this.dateDebutLocation = this.formatDateForInput(demain);

    const apresDemain = new Date();
    apresDemain.setDate(apresDemain.getDate() + 2);
    this.dateFinLocation = this.formatDateForInput(apresDemain);
  }

  /**
   * Formater une date pour input[type="date"]
   */
  protected formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * ✅ Charger le catalogue disponible pour la période sélectionnée
   */
  chargerCatalogue(): void {
    // Validation des dates
    if (!this.dateDebutLocation || !this.dateFinLocation) {
      this.errorMessage.set('Veuillez sélectionner des dates de location valides');
      this.isLoading.set(false);
      return;
    }

    if (new Date(this.dateDebutLocation) > new Date(this.dateFinLocation)) {
      this.errorMessage.set('La date de début doit être antérieure à la date de fin');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // ✅ Utiliser l'API avec dates
    if (this.categorieSelectionnee()) {
      // Recherche avec catégorie + dates
      this.produitService.searchProduitsAvecPeriode({
        categorie: this.categorieSelectionnee()!,
        dateDebut: this.dateDebutLocation,
        dateFin: this.dateFinLocation
      }).subscribe({
        next: (produits) => {
          this.produits.set(produits);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('❌ Erreur chargement catalogue:', error);
          this.errorMessage.set('Impossible de charger le catalogue');
          this.isLoading.set(false);
        }
      });
    } else {
      // Catalogue complet pour la période
      this.produitService.getCatalogueDisponibleSurPeriode(
        this.dateDebutLocation,
        this.dateFinLocation
      ).subscribe({
        next: (produits) => {
          this.produits.set(produits);
          this.isLoading.set(false);
          console.log(`✅ ${produits.length} produits disponibles du ${this.dateDebutLocation} au ${this.dateFinLocation}`);
        },
        error: (error) => {
          console.error('❌ Erreur chargement catalogue:', error);
          this.errorMessage.set('Impossible de charger le catalogue');
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * ✅ Recharger le catalogue quand les dates changent
   */
  onDatesChange(): void {
    console.log(`📅 Dates modifiées: ${this.dateDebutLocation} → ${this.dateFinLocation}`);
    this.chargerCatalogue();
  }

  /**
   * Filtrer par catégorie
   */
  filtrerParCategorie(categorie: Categorie): void {
    this.categorieSelectionnee.set(categorie);
    this.chargerCatalogue();
  }

  /**
   * Réinitialiser les filtres
   */
  reinitialiserFiltres(): void {
    this.categorieSelectionnee.set(null);
    this.rechercheNom.set('');
    this.chargerCatalogue();
  }

  /**
   * Voir les détails d'un produit
   */
  voirDetails(idProduit: number): void {
    // Passer les dates dans les query params
    this.router.navigate(['/catalogue/produit', idProduit], {
      queryParams: {
        dateDebut: this.dateDebutLocation,
        dateFin: this.dateFinLocation
      }
    });
  }

  /**
   * ✅ Ajouter au panier avec les dates sélectionnées
   */
  ajouterAuPanier(produit: ProduitResponse): void {
    // Validation des dates
    if (!this.dateDebutLocation || !this.dateFinLocation) {
      alert('⚠️ Veuillez sélectionner des dates de location');
      return;
    }

    // Vérifier la disponibilité avant d'ajouter
    this.produitService.verifierDisponibiliteSurPeriode(
      produit.idProduit,
      1, // quantité par défaut
      this.dateDebutLocation,
      this.dateFinLocation
    ).subscribe({
      next: (disponibilite) => {
        if (disponibilite.disponible) {
          // Ajouter au panier
          this.panierService.ajouterProduit({
            idProduit: produit.idProduit,
            nomProduit: produit.nomProduit,
            quantite: 1,
            prixUnitaire: produit.prixUnitaire,
            dateDebut: this.dateDebutLocation,
            dateFin: this.dateFinLocation,
            imageProduit: produit.imageProduit || ''
          });

          console.log(`✅ ${produit.nomProduit} ajouté au panier`);
        } else {
          alert(`❌ ${disponibilite.message}`);
        }
      },
      error: (error) => {
        console.error('❌ Erreur vérification disponibilité:', error);
        alert('Impossible de vérifier la disponibilité du produit');
      }
    });
  }

  /**
   * Obtenir l'URL de l'image du produit
   */
  getImageUrl(produit: ProduitResponse): string {
    if (produit.imageProduit) {
      // Si l'image est un chemin relatif, ajouter le base URL du serveur
      if (produit.imageProduit.startsWith('/') || produit.imageProduit.startsWith('uploads/')) {
        return `http://localhost:8080${produit.imageProduit.startsWith('/') ? '' : '/'}${produit.imageProduit}`;
      }
      // Si c'est déjà une URL complète, la retourner telle quelle
      return produit.imageProduit;
    }
    // Image placeholder si pas d'image
    return 'https://via.placeholder.com/300x250/C8A882/FFFFFF?text=' + encodeURIComponent(produit.nomProduit);
  }

  /**
   * Gestion des erreurs d'image
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/300x250/CCCCCC/FFFFFF?text=Image+Non+Disponible';
  }

  /**
   * Obtenir le label de la catégorie
   */
  getCategorieLabel(categorie: Categorie): string {
    const labels: Record<Categorie, string> = {
      [Categorie.LUMIERE]: 'Lumière',
      [Categorie.MOBILIER]: 'Mobilier',
      [Categorie.DECORATION]: 'Décoration',
      [Categorie.ACCESSOIRES]: 'Accessoires',
      [Categorie.STRUCTURE]: 'Structure',
      [Categorie.SONORISATION]: 'Sonorisation',
      [Categorie.MATERIEL_RESTAURATION]: 'Matériel de restauration'
    };

    // Vérification que la catégorie existe dans les labels
    if (categorie in labels) {
      return labels[categorie];
    }

    // Fallback : convertir la valeur enum en string lisible
    return categorie.toLowerCase().replace(/_/g, ' ');
  }

  /**
   * Navigation vers le panier
   */
  allerAuPanier(): void {
    this.router.navigate(['/panier']);
  }

  protected readonly Date = Date;
}
