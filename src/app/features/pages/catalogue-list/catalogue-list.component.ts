// src/app/features/pages/catalogue-list/catalogue-list.component.ts
// VERSION CORRIGÉE - Utilise les APIs avec dates

import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {ProduitService} from '../../../services/produit.service';
import {PanierService} from '../../../services/panier.service';
import {Categorie, ProduitResponse} from '../../../core/models';
import {ToastrService} from 'ngx-toastr';

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
  private toastr = inject(ToastrService);

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

  // Filtre prix
  prixMin = signal<number | null>(null);
  prixMax = signal<number | null>(null);

  // Tri
  triSelectionne = signal<string>('');

  //  Map pour stocker les disponibilités par produit
  disponibilites = signal<Map<number, number>>(new Map());

  // Computed pour filtrer les produits côté client (en plus du filtrage serveur)
  // ✅1: Computed pour filtrer les produits
  produitsFiltres = computed(() => {
    let liste = this.produits();

    // Filtre par nom
    if (this.rechercheNom()) {
      const recherche = this.rechercheNom().toLowerCase();
      liste = liste.filter(p =>
        p.nomProduit.toLowerCase().includes(recherche) ||
        (p.descriptionProduit && p.descriptionProduit.toLowerCase().includes(recherche))
      );
    }

    // Filtre par catégorie
    if (this.categorieSelectionnee()) {
      liste = liste.filter(p => p.categorieProduit === this.categorieSelectionnee());
    }

    // Filtre par prix minimum
    if (this.prixMin() !== null) {
      liste = liste.filter(p => p.prixUnitaire >= this.prixMin()!);
    }

    // Filtre par prix maximum
    if (this.prixMax() !== null) {
      liste = liste.filter(p => p.prixUnitaire <= this.prixMax()!);
    }

    // Appliquer le tri
    return this.trierListe(liste);
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

  nombreProduits = this.panierService.nombreProduits;

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
   * aujourdhui  et demain
   */
  private initialiserDatesParDefaut(): void {
    const aujourdhui = new Date();
    this.dateDebutLocation = this.formatDateForInput(aujourdhui);

    const Demain = new Date();
    Demain.setDate(Demain.getDate() + 1);
    this.dateFinLocation = this.formatDateForInput(Demain);
  }

  /**
   * Formater une date pour input[type="date"]
   */
  protected formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }


  /**
   * ⭐ Trier la liste selon le tri sélectionné
   */
  private trierListe(liste: ProduitResponse[]): ProduitResponse[] {
    const tri = this.triSelectionne();

    if (!tri) return liste;

    const copie = [...liste];

    switch (tri) {
      case 'prix-asc':
        return copie.sort((a, b) => a.prixUnitaire - b.prixUnitaire);

      case 'prix-desc':
        return copie.sort((a, b) => b.prixUnitaire - a.prixUnitaire);

      case 'nom-asc':
        return copie.sort((a, b) => a.nomProduit.localeCompare(b.nomProduit));

      case 'nom-desc':
        return copie.sort((a, b) => b.nomProduit.localeCompare(a.nomProduit));

      default:
        return copie;
    }
  }

  /**
   * ✅ Sélectionner une catégorie
   */
  selectionnerCategorie(categorie: Categorie | null): void {
    this.categorieSelectionnee.set(categorie);
    // Si catégorie spécifique, recharger avec filtrage serveur
    if (categorie !== null) {
      this.chargerCatalogue();
    }
  }

  /**
   * Réinitialiser tous les filtres
   */
  reinitialiserFiltres(): void {
    this.rechercheNom.set('');
    this.categorieSelectionnee.set(null);
    this.prixMin.set(null);
    this.prixMax.set(null);
    this.triSelectionne.set('');
    this.chargerCatalogue();

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

    // Conversion des dates en format LocalDate (YYYY-MM-DD)
    const dateDebut = this.formatToLocalDate(this.dateDebutLocation);
    const dateFin = this.formatToLocalDate(this.dateFinLocation);

    // ✅ Utiliser l'API avec dates
    if (this.categorieSelectionnee()) {
      // Recherche avec catégorie + dates
      this.produitService.searchProduitsAvecPeriode({
        categorie: this.categorieSelectionnee()!,
        dateDebut: dateDebut,
        dateFin: dateFin
      }).subscribe({
        next: (produits) => {
          this.produits.set(produits);

          // ⭐ Calculer disponibilités pour chaque produit
          produits.forEach(produit => {
            this.calculerDisponibilite(produit);
          });
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
        dateDebut,
        dateFin
      ).subscribe({
        next: (produits) => {
          this.produits.set(produits);

          produits.forEach(produit => {
            this.calculerDisponibilite(produit);
          });

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
      if (this.dateDebutLocation && this.dateFinLocation) {
      this.chargerCatalogue(); // Recharge tout + recalcule disponibilités
      }
  }

  /**
   * ✅ FIX #1: Vérifier si la date de début est supérieure à la date de fin
   */
  isDateDebutSuperieureDateFin(): boolean {
    if (!this.dateDebutLocation || !this.dateFinLocation) {
      return false; // Ne pas bloquer si les dates ne sont pas renseignées
    }
    return new Date(this.dateDebutLocation) > new Date(this.dateFinLocation);
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
      this.toastr.warning('⚠️ Veuillez sélectionner des dates de location');
      return;
    }

    // ✅ Récupérer la quantité disponible RÉELLE
    const quantiteDisponible = this.getQuantiteDisponible(produit.idProduit);

    if (quantiteDisponible === null || quantiteDisponible === 0) {
      this.toastr.error('Ce produit n\'est pas disponible pour la période sélectionnée', ' Indisponible');
      return;
    }

    // ✅ FIX #5: Vérifier la quantité déjà dans le panier
    const quantiteDansPanier = this.panierService.getQuantiteProduitDansPanier(
      produit.idProduit,
      this.dateDebutLocation,
      this.dateFinLocation
    );

    // ✅ Vérifier si on peut encore ajouter
    if (quantiteDansPanier >= quantiteDisponible) {
      this.toastr.error(
        `Maximum atteint : ${quantiteDisponible} disponible(s), ${quantiteDansPanier} déjà dans le panier`,
        '❌ Stock insuffisant'
      );
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
          this.toastr.success(`${produit.nomProduit} ajouté au panier`, ' Succès');
        } else {
          this.toastr.error(disponibilite.message || 'Produit indisponible', ' Stock insuffisant');
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

  // Méthode utilitaire pour formater en LocalDate
  private formatToLocalDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }



  /**
   * ⭐  Calculer la disponibilité d'un produit sur la période
   */
  calculerDisponibilite(produit: ProduitResponse): void {
    if (!this.dateDebutLocation || !this.dateFinLocation) {
      return;
    }

    this.produitService.calculerQuantiteDisponibleSurPeriode(
      produit.idProduit,
      this.dateDebutLocation,
      this.dateFinLocation
    ).subscribe({
      next: (quantite) => {
        const dispos = new Map(this.disponibilites());
        dispos.set(produit.idProduit, quantite);
        this.disponibilites.set(dispos);
      },
      error: (error) => {
        console.error('Erreur calcul disponibilité:', error);
      }
    });
  }

  /**
   * ⭐  Obtenir la quantité disponible d'un produit
   */
  getQuantiteDisponible(idProduit: number): number | null {
    return this.disponibilites().get(idProduit) ?? null;
  }

  /**
   * ✅ FIX #5: Vérifier si on peut encore ajouter ce produit au panier
   */
  peutAjouterAuPanier(produit: ProduitResponse): boolean {
    const quantiteDisponible = this.getQuantiteDisponible(produit.idProduit);

    if (quantiteDisponible === null || quantiteDisponible === 0) {
      return false;
    }

    const quantiteDansPanier = this.panierService.getQuantiteProduitDansPanier(
      produit.idProduit,
      this.dateDebutLocation,
      this.dateFinLocation
    );

    return quantiteDansPanier < quantiteDisponible;
  }

}
