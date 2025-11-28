import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AvisService } from '../../../../services/avis.service';
import { ProduitService } from '../../../../services/produit.service';
import {forkJoin} from 'rxjs';
import { map } from 'rxjs/operators';

interface TopProduit {
  id: number;
  nom: string;
  moyenne: number;
  nombreAvis: number;
}
@Component({
  selector: 'app-avis-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avis-statistiques.component.html',
  styleUrl: './avis-statistiques.component.scss'
})
export class AvisStatistiquesComponent implements OnInit {
  private avisService = inject(AvisService);
  private produitService = inject(ProduitService);
  private router = inject(Router);

  loading = signal(false);
  nombreEnAttente = signal(0);
  totalApprouves = signal(0);
  moyenneGlobale = signal(0);
  produitsAvecAvis = signal(0);
  topProduits = signal<TopProduit[]>([]);

  ngOnInit(): void {
    this.chargerStatistiques();
  }

  chargerStatistiques(): void {
    this.loading.set(true);

    // Nombre en attente
    this.avisService.getNombreAvisEnAttente().subscribe({
      next: (count) => this.nombreEnAttente.set(count)
    });

    // Tous les avis pour calculer moyenne globale et total approuvés
    this.avisService.getAllAvis().subscribe({
      next: (avis) => {
        const approuves = avis.filter(a => a.statut === 'APPROUVE');
        this.totalApprouves.set(approuves.length);

        if (approuves.length > 0) {
          const somme = approuves.reduce((acc, a) => acc + a.note, 0);
          this.moyenneGlobale.set(somme / approuves.length);
        }
      }
    });

    // Top produits avec leurs détails
    this.avisService.getTopProduitsParNote(1).subscribe({
      next: (data: any[]) => {
        // data = [[idProduit, moyenne, nombreAvis], ...]

        if (data.length === 0) {
          this.loading.set(false);
          return;
        }

        // Créer un tableau d'observables pour charger les détails des produits
        const produitsObservables = data.map(([id, moyenne, nombre]) =>
          this.produitService.getProduitById(id).pipe(
            map(produit => ({
              id: id,
              nom: produit.nomProduit,
              moyenne: parseFloat(moyenne),
              nombreAvis: nombre
            }))
          )
        );

        // Charger tous les produits en parallèle
        forkJoin(produitsObservables).subscribe({
          next: (produits) => {
            this.topProduits.set(produits);
            this.produitsAvecAvis.set(produits.length);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  voirDetailsProduit(id: number): void {
    this.router.navigate(['/admin/produits', id, 'avis']);
  }
}
