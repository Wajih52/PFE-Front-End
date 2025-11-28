import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../../../services/avis.service';
import { ProduitService } from '../../../../services/produit.service';
import { AvisResponseDto, AvisModerationDto, StatutAvis, StatistiquesAvisDto } from '../../../../core/models/avis.model';
import { ProduitResponse } from '../../../../core/models';

@Component({
  selector: 'app-produit-avis-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produit-avis-admin.component.html',
  styleUrl: './produit-avis-admin.component.scss'
})
export class ProduitAvisAdminComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private avisService = inject(AvisService);
  private produitService = inject(ProduitService);

  produit = signal<ProduitResponse | null>(null);
  avisList = signal<AvisResponseDto[]>([]);
  avisAffiches = signal<AvisResponseDto[]>([]);
  statistiques = signal<StatistiquesAvisDto | null>(null);
  filtreStatut = signal<string>('TOUS');
  loading = signal(false);
  commentairesModeration: { [key: number]: string } = {};
  Math = Math;
  StatutAvis = StatutAvis;

  idProduit!: number;

  ngOnInit(): void {
    this.idProduit = +this.route.snapshot.paramMap.get('id')!;
    this.chargerProduit();
    this.chargerAvis();
    this.chargerStatistiques();
  }

  chargerProduit(): void {
    this.produitService.getProduitById(this.idProduit).subscribe({
      next: (produit) => this.produit.set(produit)
    });
  }

  chargerAvis(): void {
    this.loading.set(true);
    this.avisService.getAllAvisByProduit(this.idProduit).subscribe({
      next: (avis) => {
        this.avisList.set(avis);
        this.appliquerFiltre();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  chargerStatistiques(): void {
    this.avisService.getStatistiquesProduit(this.idProduit).subscribe({
      next: (stats) => this.statistiques.set(stats)
    });
  }

  filtrerPar(statut: string): void {
    this.filtreStatut.set(statut);
    this.appliquerFiltre();
  }

  appliquerFiltre(): void {
    const statut = this.filtreStatut();
    if (statut === 'TOUS') {
      this.avisAffiches.set(this.avisList());
    } else {
      this.avisAffiches.set(
        this.avisList().filter(a => a.statut === statut as StatutAvis)
      );
    }
  }

  compterParStatut(statut: string): number {
    return this.avisList().filter(a => a.statut === statut as StatutAvis).length;
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

  approuverAvis(avis: AvisResponseDto): void {
    const dto: AvisModerationDto = {
      idAvis: avis.idAvis,
      statut: StatutAvis.APPROUVE,
      commentaireModeration: this.commentairesModeration[avis.idAvis]
    };

    this.avisService.modererAvis(dto).subscribe({
      next: () => {
        this.chargerAvis();
        this.chargerStatistiques();
        delete this.commentairesModeration[avis.idAvis];
      },
      error: () => alert('Erreur lors de l\'approbation')
    });
  }

  rejeterAvis(avis: AvisResponseDto): void {
    const dto: AvisModerationDto = {
      idAvis: avis.idAvis,
      statut: StatutAvis.REJETE,
      commentaireModeration: this.commentairesModeration[avis.idAvis] || 'Contenu inapproprié'
    };

    this.avisService.modererAvis(dto).subscribe({
      next: () => {
        this.chargerAvis();
        this.chargerStatistiques();
        delete this.commentairesModeration[avis.idAvis];
      },
      error: () => alert('Erreur lors du rejet')
    });
  }

  supprimerDefinitivement(avis: AvisResponseDto): void {
    if (!confirm('Supprimer définitivement cet avis ?')) return;

    this.avisService.supprimerAvisDefinitivement(avis.idAvis).subscribe({
      next: () => {
        this.chargerAvis();
        this.chargerStatistiques();
      },
      error: () => alert('Erreur lors de la suppression')
    });
  }

  getStatutLabel(statut: StatutAvis): string {
    switch (statut) {
      case StatutAvis.EN_ATTENTE: return 'En attente';
      case StatutAvis.APPROUVE: return 'Approuvé';
      case StatutAvis.REJETE: return 'Rejeté';
      default: return statut;
    }
  }

  getStatutClass(statut: StatutAvis): string {
    switch (statut) {
      case StatutAvis.EN_ATTENTE: return 'en-attente';
      case StatutAvis.APPROUVE: return 'approuve';
      case StatutAvis.REJETE: return 'rejete';
      default: return '';
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/avis/statistiques']);
  }
}
