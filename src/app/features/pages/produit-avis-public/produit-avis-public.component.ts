import { Component, OnInit, inject, signal } from '@angular/core';
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

  idProduit!: number;

  ngOnInit(): void {
    this.idProduit = +this.route.snapshot.paramMap.get('id')!;
    this.chargerAvis();
    this.chargerStatistiques();
  }

  chargerAvis(): void {
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
