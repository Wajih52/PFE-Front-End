// src/app/features/catalogue/produit-detail.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../../../services/produit.service';
import { PanierService } from '../../../../services/panier.service';
import { ReservationService } from '../../../../services/reservation.service';
import { ProduitResponse } from '../../../../core/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produit-detail.component.html',
  styleUrls: ['./produit-detail.component.scss']
})
export class ProduitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produitService = inject(ProduitService);
  private panierService = inject(PanierService);
  private reservationService = inject(ReservationService);
  private toastr = inject(ToastrService);

  // State
  produit = signal<ProduitResponse | null>(null);
  loading = signal<boolean>(true);
  verificationLoading = signal<boolean>(false);

  // Formulaire
  quantite = signal<number>(1);
  dateDebut = signal<string>('');
  dateFin = signal<string>('');

  // Disponibilité
  disponibilite = signal<{
    disponible: boolean;
    quantiteDisponible: number;
    message?: string;
  } | null>(null);

  // Computed
  dateDebutMin = computed(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  dateFinMin = computed(() => {
    const debut = this.dateDebut();
    if (!debut) return this.dateDebutMin();

    const debutDate = new Date(debut);
    debutDate.setDate(debutDate.getDate() + 1);
    return debutDate.toISOString().split('T')[0];
  });

  sousTotal = computed(() => {
    const prod = this.produit();
    const qte = this.quantite();
    const debut = this.dateDebut();
    const fin = this.dateFin();

    if (!prod || !debut || !fin) return 0;

    const nbJours = this.calculerNombreJours(debut, fin);
    return qte * prod.prixUnitaire * nbJours;
  });

  peutAjouterPanier = computed(() => {
    const dispo = this.disponibilite();
    const qte = this.quantite();
    return dispo && dispo.disponible && dispo.quantiteDisponible >= qte;
  });

  ngOnInit(): void {
    const idProduit = this.route.snapshot.paramMap.get('id');
    if (idProduit) {
      this.chargerProduit(+idProduit);
    }
  }

  chargerProduit(id: number): void {
    this.loading.set(true);
    this.produitService.getProduitById(id).subscribe({
      next: (produit) => {
        this.produit.set(produit);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
        this.toastr.error('Produit introuvable', 'Erreur');
        this.router.navigate(['/catalogue']);
      }
    });
  }

  verifierDisponibilite(): void {
    const prod = this.produit();
    const debut = this.dateDebut();
    const fin = this.dateFin();
    const qte = this.quantite();

    if (!prod || !debut || !fin) {
      this.toastr.warning('Veuillez sélectionner les dates', 'Attention');
      return;
    }

    if (new Date(debut) >= new Date(fin)) {
      this.toastr.error('La date de fin doit être après la date de début', 'Erreur');
      return;
    }

    this.verificationLoading.set(true);

    this.reservationService.verifierDisponibilite({
      idProduit: prod.idProduit,
      quantite: qte,
      dateDebut: debut,
      dateFin: fin
    }).subscribe({
      next: (result) => {
        this.disponibilite.set({
          disponible: result.disponible,
          quantiteDisponible: result.quantiteDisponible,
          message: result.message
        });

        if (result.disponible) {
          this.toastr.success(
            `${result.quantiteDisponible} unités disponibles`,
            '✅ Disponible'
          );
        } else {
          this.toastr.warning(result.message || 'Produit non disponible', '⚠️ Indisponible');
        }

        this.verificationLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur vérification:', error);
        this.toastr.error('Erreur lors de la vérification', 'Erreur');
        this.verificationLoading.set(false);
      }
    });
  }

  ajouterAuPanier(): void {
    const prod = this.produit();
    const debut = this.dateDebut();
    const fin = this.dateFin();
    const qte = this.quantite();

    if (!prod || !debut || !fin) {
      this.toastr.warning('Veuillez remplir tous les champs', 'Attention');
      return;
    }

    if (!this.peutAjouterPanier()) {
      this.toastr.error('Veuillez vérifier la disponibilité d\'abord', 'Erreur');
      return;
    }

    this.panierService.ajouterProduit({
      idProduit: prod.idProduit,
      nomProduit: prod.nomProduit,
      prixUnitaire: prod.prixUnitaire,
      quantite: qte,
      dateDebut: debut,
      dateFin: fin,
      imageProduit: prod.imageProduit,
      categorie: prod.categorieProduit
    });

    // Réinitialiser le formulaire
    this.quantite.set(1);
    this.disponibilite.set(null);
  }

  modifierQuantite(delta: number): void {
    const nouvelle = this.quantite() + delta;
    if (nouvelle >= 1) {
      this.quantite.set(nouvelle);

      // Re-vérifier si une vérification a déjà été faite
      if (this.disponibilite()) {
        this.verifierDisponibilite();
      }
    }
  }

  calculerNombreJours(debut: string, fin: string): number {
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);
    const diff = dateFin.getTime() - dateDebut.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  formatCategorie(cat: string): string {
    return cat.replace(/_/g, ' ');
  }

  allerAuPanier(): void {
    this.router.navigate(['/panier']);
  }
}
