import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CongeService } from '../../../../services/conge.service';
import { UtilisateurService } from '../../../../services/utilisateur.service';
import { NotificationService } from '../../../../services/notification.service';
import { DemandeCongeResponse, StatutDemandeConge, StatutDemandeCongeLabels } from '../../../../core/models/conge.model';
import { UserResponse } from '../../../../core/models';

@Component({
  selector: 'app-conges-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './conges-admin.component.html',
  styleUrl: './conges-admin.component.scss'
})
export class CongesAdminComponent implements OnInit {
  private congeService = inject(CongeService);
  private utilisateurService = inject(UtilisateurService);
  private notificationService = inject(NotificationService);

  // Signals de données
  demandes = signal<DemandeCongeResponse[]>([]);
  employes = signal<UserResponse[]>([]);
  isLoading = signal<boolean>(false);

  // Navigation et Filtres
  activeTab = signal<'demandes' | 'soldes'>('demandes');
  filtreStatut = signal<StatutDemandeConge | 'TOUTES'>('TOUTES');
  rechercheTexte = signal<string>('');

  // Modal de modification du solde
  showSoldeModal = signal<boolean>(false);
  selectedEmploye = signal<UserResponse | null>(null);
  nouveauSolde = signal<number>(30);

  readonly StatutDemandeConge = StatutDemandeConge;
  readonly statutLabels = StatutDemandeCongeLabels;

  // Computed : Demandes filtrées
  demandesFiltrees = computed(() => {
    let list = this.demandes();
    if (this.filtreStatut() !== 'TOUTES') {
      list = list.filter(d => d.statut === this.filtreStatut());
    }
    const search = this.rechercheTexte().toLowerCase().trim();
    if (search) {
      list = list.filter(d =>
        d.nomCompletEmploye.toLowerCase().includes(search) ||
        d.motif.toLowerCase().includes(search)
      );
    }
    return list;
  });

  // Computed : Compteurs KPI
  stats = computed(() => {
    const all = this.demandes();
    return {
      total: all.length,
      enAttente: all.filter(d => d.statut === StatutDemandeConge.EN_ATTENTE).length,
      acceptees: all.filter(d => d.statut === StatutDemandeConge.ACCEPTEE).length,
      refusees: all.filter(d => d.statut === StatutDemandeConge.REFUSEE).length
    };
  });

  ngOnInit(): void {
    this.chargerDemandes();
    this.chargerEmployes();
  }

  chargerDemandes(): void {
    this.isLoading.set(true);
    this.congeService.getToutesLesDemandes().subscribe({
      next: (data) => {
        this.demandes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des demandes de congés');
        this.isLoading.set(false);
      }
    });
  }

  chargerEmployes(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (users) => {
        this.employes.set(users.filter(u =>
          u.etatCompte === 'ACTIVE' &&
          u.roles.some(r => r === 'EMPLOYE' || r === 'MANAGER' || r === 'ADMIN')
        ));
      },
      error: (err) => console.error('Erreur chargement employés:', err)
    });
  }

  traiterDemande(demande: DemandeCongeResponse, accepter: boolean): void {
    const actionLabel = accepter ? 'accepter' : 'refuser';
    if (!confirm(`Voulez-vous vraiment ${actionLabel} la demande de ${demande.nomCompletEmploye} ?`)) {
      return;
    }

    this.isLoading.set(true);
    this.congeService.traiterDemande(demande.idDemande, accepter).subscribe({
      next: () => {
        this.notificationService.success(
          accepter ? 'Demande acceptée et pointages générés !' : 'Demande refusée.'
        );
        this.chargerDemandes();
        this.chargerEmployes();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erreur lors du traitement');
        this.isLoading.set(false);
      }
    });
  }

  ouvrirModalSolde(employe: UserResponse): void {
    this.selectedEmploye.set(employe);
    this.nouveauSolde.set((employe as any).soldeConges ?? 30);
    this.showSoldeModal.set(true);
  }

  fermerModalSolde(): void {
    this.showSoldeModal.set(false);
    this.selectedEmploye.set(null);
  }

  enregistrerSolde(): void {
    const emp = this.selectedEmploye();
    if (!emp || this.nouveauSolde() < 0) return;

    this.congeService.modifierSoldeEmploye(emp.idUtilisateur, this.nouveauSolde()).subscribe({
      next: () => {
        this.notificationService.success(`Solde mis à jour pour ${emp.prenom} ${emp.nom}`);
        this.fermerModalSolde();
        this.chargerEmployes();
        this.chargerDemandes();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erreur lors de la modification du solde');
      }
    });
  }

  getSoldeEmploye(employe: UserResponse): number {
    return (employe as any).soldeConges ?? 30;
  }

  getBadgeClass(statut: StatutDemandeConge): string {
    switch (statut) {
      case StatutDemandeConge.ACCEPTEE: return 'badge-success';
      case StatutDemandeConge.REFUSEE: return 'badge-danger';
      default: return 'badge-warning';
    }
  }
}
