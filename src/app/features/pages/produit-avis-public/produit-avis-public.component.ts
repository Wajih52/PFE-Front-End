import {Component, OnInit, inject, signal, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AvisService } from '../../../services/avis.service';
import { AvisResponseDto, StatistiquesAvisDto } from '../../../core/models/avis.model';

@Component({
  selector: 'app-produit-avis-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './produit-avis-public.component.html',
  styleUrl: './produit-avis-public.component.scss'
})
export class ProduitAvisPublicComponent implements OnInit {
  private avisService = inject(AvisService);
  private route = inject(ActivatedRoute);

  avisList = signal<AvisResponseDto[]>([]);
  statistiques = signal<StatistiquesAvisDto | null>(null);
  loading = signal(false);
  Math = Math;


  @Input() idProduit?: number;

  ngOnInit(): void {
    // Si pas d'@Input, récupérer depuis la route (mode page dédiée)
    if (!this.idProduit) {
      const routeId = this.route.snapshot.paramMap.get('id');
      if (routeId) {
        this.idProduit = +routeId;
      }
    }

    // Vérifier que l'ID est valide avant de charger
    if (this.idProduit && this.idProduit > 0) {
      console.log(' Chargement des avis pour le produit ID:', this.idProduit);
      this.chargerAvis();
      this.chargerStatistiques();
    } else {
      console.error(' Aucun ID de produit valide fourni à produit-avis-public');
    }

  }

  chargerAvis(): void {

    if (!this.idProduit) return;

    this.loading.set(true);
    this.avisService.getAvisProduit(this.idProduit).subscribe({
      next: (avis) => {
        this.avisList.set(avis);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  chargerStatistiques(): void {
    if (!this.idProduit) return;

    this.avisService.getStatistiquesProduit(this.idProduit).subscribe({
      next: (stats) => {
        this.statistiques.set(stats);
      }
    });
  }

  getPourcentage(etoile: number): number {
    if (!this.statistiques()) return 0;
    const stats = this.statistiques()!;
    switch (etoile) {
      case 5: return stats.pourcentage5Etoiles;
      case 4: return stats.pourcentage4Etoiles;
      case 3: return stats.pourcentage3Etoiles;
      case 2: return stats.pourcentage2Etoiles;
      case 1: return stats.pourcentage1Etoile;
      default: return 0;
    }
  }

  getNombre(etoile: number): number {
    if (!this.statistiques()) return 0;
    const stats = this.statistiques()!;
    switch (etoile) {
      case 5: return stats.nombre5Etoiles;
      case 4: return stats.nombre4Etoiles;
      case 3: return stats.nombre3Etoiles;
      case 2: return stats.nombre2Etoiles;
      case 1: return stats.nombre1Etoile;
      default: return 0;
    }
  }
}
