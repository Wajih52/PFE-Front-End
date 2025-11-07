// src/app/features/catalogue/catalogue-list.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../../services/produit.service';
import { PanierService } from '../../../services/panier.service';
import { ProduitResponse, Categorie, TypeProduit } from '../../../core/models';
import { ToastrService } from 'ngx-toastr';
import { ProduitCardComponent } from './components/produit-card.component';

@Component({
  selector: 'app-catalogue-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProduitCardComponent],
  templateUrl: './catalogue-list.component.html',
  styleUrls: ['./catalogue-list.component.scss']
})
export class CatalogueListComponent implements OnInit {
  private produitService = inject(ProduitService);
  private panierService = inject(PanierService);
  private toastr = inject(ToastrService);

  // Signals
  produits = signal<ProduitResponse[]>([]);
  loading = signal<boolean>(true);

  // Filtres
  filtres = signal({
    recherche: '',
    categorie: '' as Categorie | '',
    typeProduit: '' as TypeProduit | '',
    prixMin: 0,
    prixMax: 1000,
    disponibleUniquement: false
  });

  // Tri
  triActuel = signal<'nom' | 'prix-asc' | 'prix-desc' | 'populaire'>('nom');

  // Computed: produits filtrés
  produitsFiltres = computed(() => {
    let resultat = this.produits();
    const f = this.filtres();

    // Filtre par recherche
    if (f.recherche) {
      const search = f.recherche.toLowerCase();
      resultat = resultat.filter(p =>
        p.nomProduit.toLowerCase().includes(search) ||
        p.descriptionProduit?.toLowerCase().includes(search)
      );
    }

    // Filtre par catégorie
    if (f.categorie) {
      resultat = resultat.filter(p => p.categorieProduit === f.categorie);
    }

    // Filtre par type
    if (f.typeProduit) {
      resultat = resultat.filter(p => p.typeProduit === f.typeProduit);
    }

    // Filtre par prix
    resultat = resultat.filter(p =>
      p.prixUnitaire >= f.prixMin && p.prixUnitaire <= f.prixMax
    );

    // Filtre disponibilité
    if (f.disponibleUniquement) {
      resultat = resultat.filter(p => p.quantiteDisponible && p.quantiteDisponible > 0);
    }

    // Tri
    const tri = this.triActuel();
    if (tri === 'nom') {
      resultat.sort((a, b) => a.nomProduit.localeCompare(b.nomProduit));
    } else if (tri === 'prix-asc') {
      resultat.sort((a, b) => a.prixUnitaire - b.prixUnitaire);
    } else if (tri === 'prix-desc') {
      resultat.sort((a, b) => b.prixUnitaire - a.prixUnitaire);
    }

    return resultat;
  });

  // Énumérations pour les selects
  categories = Object.values(Categorie);
  typesProduits = Object.values(TypeProduit);

  // Badge panier
  totalPanier = this.panierService.totalArticles;

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    this.loading.set(true);
    this.produitService.getAllProduits().subscribe({
      next: (produits) => {
        this.produits.set(produits);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement produits:', error);
        this.toastr.error('Impossible de charger les produits', 'Erreur');
        this.loading.set(false);
      }
    });
  }

  // Gestion des filtres
  updateRecherche(value: string): void {
    this.filtres.update(f => ({ ...f, recherche: value }));
  }

  updateCategorie(value: string): void {
    this.filtres.update(f => ({ ...f, categorie: value as Categorie | '' }));
  }

  updateTypeProduit(value: string): void {
    this.filtres.update(f => ({ ...f, typeProduit: value as TypeProduit | '' }));
  }

  updatePrixMin(value: number): void {
    this.filtres.update(f => ({ ...f, prixMin: value }));
  }

  updatePrixMax(value: number): void {
    this.filtres.update(f => ({ ...f, prixMax: value }));
  }

  toggleDisponibilite(): void {
    this.filtres.update(f => ({ ...f, disponibleUniquement: !f.disponibleUniquement }));
  }

  reinitialiserFiltres(): void {
    this.filtres.set({
      recherche: '',
      categorie: '',
      typeProduit: '',
      prixMin: 0,
      prixMax: 1000,
      disponibleUniquement: false
    });
  }

  changerTri(tri: 'nom' | 'prix-asc' | 'prix-desc' | 'populaire'): void {
    this.triActuel.set(tri);
  }

  // Formatage
  formatCategorie(cat: string): string {
    return cat.replace(/_/g, ' ');
  }

  formatTypeProduit(type: string): string {
    return type === 'EN_QUANTITE' ? 'Par Quantité' : 'Avec Référence';
  }
}
