import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../../../services/avis.service';
import { AvisResponseDto, AvisModerationDto, StatutAvis } from '../../../../core/models/avis.model';
import {NotificationPersistantService} from '../../../../services/notification-persistant.service';


@Component({
  selector: 'app-avis-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avis-moderation.component.html',
  styleUrl: './avis-moderation.component.scss'
})
export class AvisModerationComponent implements OnInit {
  private avisService = inject(AvisService);
  private notificationPersist = inject(NotificationPersistantService)
  tousLesAvis = signal<AvisResponseDto[]>([]);
  avisAffiches = signal<AvisResponseDto[]>([]);
  filtreStatut = signal<string>('EN_ATTENTE');
  loading = signal(false);
  commentairesModeration: { [key: number]: string } = {};
  compteurs = signal({ enAttente: 0, tous: 0, approuves: 0, rejetes: 0 });
  StatutAvis = StatutAvis;
  ngOnInit(): void {
    this.chargerAvis();
  }
  chargerAvis(): void {
    this.loading.set(true);
    this.avisService.getAllAvis().subscribe({
      next: (avis) => {
        this.tousLesAvis.set(avis);
        this.calculerCompteurs();
        this.appliquerFiltre();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
  calculerCompteurs(): void {
    const avis = this.tousLesAvis();
    this.compteurs.set({
      enAttente: avis.filter(a => a.statut === StatutAvis.EN_ATTENTE).length,
      tous: avis.length,
      approuves: avis.filter(a => a.statut === StatutAvis.APPROUVE).length,
      rejetes: avis.filter(a => a.statut === StatutAvis.REJETE).length
    });
  }
  filtrerPar(statut: string): void {
    this.filtreStatut.set(statut);
    this.appliquerFiltre();
  }
  appliquerFiltre(): void {
    const statut = this.filtreStatut();
    if (statut === 'TOUS') {
      this.avisAffiches.set(this.tousLesAvis());
    } else {
      this.avisAffiches.set(
        this.tousLesAvis().filter(a => a.statut === statut as StatutAvis)
      );
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
        delete this.commentairesModeration[avis.idAvis];
        this.notificationPersist.refreshCount();
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
        delete this.commentairesModeration[avis.idAvis];
        this.notificationPersist.refreshCount();
      },
      error: () => alert('Erreur lors du rejet')
    });
  }
  supprimerDefinitivement(avis: AvisResponseDto): void {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    this.avisService.supprimerAvisDefinitivement(avis.idAvis).subscribe({
      next: () => this.chargerAvis(),
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
}
