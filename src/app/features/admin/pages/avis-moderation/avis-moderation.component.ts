import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../../../services/avis.service';
import { AvisResponseDto, AvisModerationDto, StatutAvis } from '../../../../core/models/avis.model';
import { NotificationPersistantService } from '../../../../services/notification-persistant.service';

@Component({
  selector: 'app-avis-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avis-moderation.component.html',
  styleUrl: './avis-moderation.component.scss'
})
export class AvisModerationComponent implements OnInit {
  private avisService = inject(AvisService);
  private notificationPersist = inject(NotificationPersistantService);

  // Données
  tousLesAvis = signal<AvisResponseDto[]>([]);

  // Filtres
  filtreStatut = signal<string>('EN_ATTENTE');
  rechercheClient = signal<string>('');
  rechercheProduit = signal<string>('');
  filtreNote = signal<number | null>(null);
  triSelectionne = signal<string>('date-desc');

  // États
  loading = signal(false);
  commentairesModeration: { [key: number]: string } = {};

  // Computed - Compteurs
  compteurs = computed(() => {
    const avis = this.tousLesAvis();
    return {
      enAttente: avis.filter(a => a.statut === StatutAvis.EN_ATTENTE).length,
      tous: avis.length,
      approuves: avis.filter(a => a.statut === StatutAvis.APPROUVE).length,
      rejetes: avis.filter(a => a.statut === StatutAvis.REJETE).length
    };
  });

  // Computed - Avis filtrés et triés
  avisAffiches = computed(() => {
    let avis = this.tousLesAvis();

    // Filtre par statut
    const statut = this.filtreStatut();
    if (statut !== 'TOUS') {
      avis = avis.filter(a => a.statut === statut as StatutAvis);
    }

    // Recherche par client
    const client = this.rechercheClient().toLowerCase();
    if (client) {
      avis = avis.filter(a =>
        a.nomClient.toLowerCase().includes(client) ||
        a.prenomClient.toLowerCase().includes(client) ||
        (a.emailClient && a.emailClient.toLowerCase().includes(client))
      );
    }

    // Recherche par produit
    const produit = this.rechercheProduit().toLowerCase();
    if (produit) {
      avis = avis.filter(a =>
        a.nomProduit.toLowerCase().includes(produit) ||
        (a.codeProduit && a.codeProduit.toLowerCase().includes(produit))
      );
    }

    // Filtre par note
    const note = this.filtreNote();
    if (note !== null) {
      avis = avis.filter(a => a.note === note);
    }

    // Tri
    const tri = this.triSelectionne();
    avis = [...avis].sort((a, b) => {
      switch (tri) {
        case 'date-desc':
          return new Date(b.dateAvis).getTime() - new Date(a.dateAvis).getTime();
        case 'date-asc':
          return new Date(a.dateAvis).getTime() - new Date(b.dateAvis).getTime();
        case 'note-desc':
          return b.note - a.note;
        case 'note-asc':
          return a.note - b.note;
        case 'client-asc':
          return a.nomClient.localeCompare(b.nomClient);
        case 'produit-asc':
          return a.nomProduit.localeCompare(b.nomProduit);
        default:
          return 0;
      }
    });

    return avis;
  });

  StatutAvis = StatutAvis;

  ngOnInit(): void {
    this.chargerAvis();
  }

  chargerAvis(): void {
    this.loading.set(true);
    this.avisService.getAllAvis().subscribe({
      next: (avis) => {
        this.tousLesAvis.set(avis);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  filtrerPar(statut: string): void {
    this.filtreStatut.set(statut);
  }

  reinitialiserFiltres(): void {
    this.rechercheClient.set('');
    this.rechercheProduit.set('');
    this.filtreNote.set(null);
    this.triSelectionne.set('date-desc');
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

  toggleVisibilite(avis: AvisResponseDto): void {
    const nouvelleVisibilite = !avis.visible;
    const message = nouvelleVisibilite ?
      'Voulez-vous rendre cet avis visible au public ?' :
      'Voulez-vous masquer cet avis du public ?';

    if (!confirm(message)) return;

    this.avisService.modifierVisibilite(avis.idAvis, nouvelleVisibilite).subscribe({
      next: () => {
        this.chargerAvis();
      },
      error: () => alert('Erreur lors de la modification de la visibilité')
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
