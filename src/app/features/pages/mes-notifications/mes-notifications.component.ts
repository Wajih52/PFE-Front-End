import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationPersistantService } from '../../../services/notification-persistant.service';
import { NotificationResponse, TypeNotification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../services/notification.service';
import {Toast, ToastrService} from 'ngx-toastr';

// Interface pour le groupement
interface NotificationGroup {
  type: TypeNotification;
  typeLibelle: string;
  typeIcone: string;
  count: number;
  notifications: NotificationResponse[];
}

type FiltreStatut = 'TOUTES' | 'NON_LUES' | 'LUES';
type TriOption = 'date_desc' | 'date_asc';

@Component({
  selector: 'app-mes-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-notifications.component.html',
  styleUrls: ['./mes-notifications.component.scss']
})
export class MesNotificationsComponent implements OnInit {
  private notificationPersistService = inject(NotificationPersistantService);
  private notificationToast = inject(ToastrService);
  private router = inject(Router);

  // État
  toutesNotifications = signal<NotificationResponse[]>([]);
  isLoading = signal<boolean>(false);

  // Filtres et tri
  filtreStatut = signal<FiltreStatut>('TOUTES');
  filtreType = signal<string>('TOUS');
  triActif = signal<TriOption>('date_desc');
  affichageGroupe = signal<boolean>(false);

  // Statistiques
  nombreTotal = computed(() => this.toutesNotifications().length);
  nombreNonLues = computed(() =>
    this.toutesNotifications().filter(n => !n.lue).length
  );
  nombreLues = computed(() =>
    this.toutesNotifications().filter(n => n.lue).length
  );

  // Notifications filtrées et triées
  notificationsFiltrees = computed(() => {
    let notifications = [...this.toutesNotifications()];

    // Filtre par statut
    switch (this.filtreStatut()) {
      case 'NON_LUES':
        notifications = notifications.filter(n => !n.lue);
        break;
      case 'LUES':
        notifications = notifications.filter(n => n.lue);
        break;
    }

    // Filtre par type
    if (this.filtreType() !== 'TOUS') {
      notifications = notifications.filter(n =>
        n.typeNotification === this.filtreType()
      );
    }

    // Tri
    notifications.sort((a, b) => {
      const dateA = new Date(a.dateCreation).getTime();
      const dateB = new Date(b.dateCreation).getTime();
      return this.triActif() === 'date_desc' ? dateB - dateA : dateA - dateB;
    });

    return notifications;
  });

  // Notifications groupées par type
  notificationsGroupees = computed(() => {
    if (!this.affichageGroupe()) {
      return [];
    }

    const groupes = new Map<TypeNotification, NotificationGroup>();

    this.notificationsFiltrees().forEach(notif => {
      const type = notif.typeNotification;

      if (!groupes.has(type)) {
        groupes.set(type, {
          type: type,
          typeLibelle: notif.typeLibelle,
          typeIcone: notif.typeIcone,
          count: 0,
          notifications: []
        });
      }

      const groupe = groupes.get(type)!;
      groupe.count++;
      groupe.notifications.push(notif);
    });

    return Array.from(groupes.values()).sort((a, b) =>
      b.count - a.count // Trier par nombre décroissant
    );
  });

  // Types de notifications disponibles
  typesDisponibles = computed(() => {
    const types = new Set<string>();
    this.toutesNotifications().forEach(n => types.add(n.typeNotification));
    return Array.from(types).sort();
  });

  ngOnInit(): void {
    this.chargerNotifications();
  }

  /**
   * Charger toutes les notifications
   */
  chargerNotifications(): void {
    this.isLoading.set(true);

    this.notificationPersistService.getNotifications().subscribe({
      next: (notifications) => {
        this.toutesNotifications.set(notifications);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notifications:', error);
        this.notificationToast.error('Erreur lors du chargement');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Cliquer sur une notification
   */
  onNotificationClick(notification: NotificationResponse): void {
    // Marquer comme lue si non lue
    if (!notification.lue) {
      this.notificationPersistService.marquerCommeLue(notification.idNotification).subscribe({
        next: () => {
          // Mettre à jour localement
          const notifications = this.toutesNotifications().map(n =>
            n.idNotification === notification.idNotification
              ? { ...n, lue: true, dateLecture: new Date().toISOString() }
              : n
          );
          this.toutesNotifications.set(notifications);
        }
      });
    }

    // Navigation si URL d'action existe
    if (notification.urlAction) {
      this.router.navigateByUrl(notification.urlAction);
    }
  }

  /**
   * Marquer une notification comme lue
   */
  marquerCommeLue(event: Event, notification: NotificationResponse): void {
    event.stopPropagation();

    if (notification.lue) return;

    this.notificationPersistService.marquerCommeLue(notification.idNotification).subscribe({
      next: () => {
        const notifications = this.toutesNotifications().map(n =>
          n.idNotification === notification.idNotification
            ? { ...n, lue: true, dateLecture: new Date().toISOString() }
            : n
        );
        this.toutesNotifications.set(notifications);
        this.notificationToast.success('Notification marquée comme lue');
      }
    });
  }

  /**
   * Supprimer une notification
   */
  supprimerNotification(event: Event, notification: NotificationResponse): void {
    event.stopPropagation();

    if (!confirm('Supprimer cette notification ?')) return;

    this.notificationPersistService.supprimerNotification(notification.idNotification).subscribe({
      next: () => {
        const notifications = this.toutesNotifications().filter(n =>
          n.idNotification !== notification.idNotification
        );
        this.toutesNotifications.set(notifications);
        this.notificationToast.success('Notification supprimée');
      }
    });
  }

  /**
   * Marquer toutes comme lues
   */
  marquerToutesCommeLues(): void {
    if (this.nombreNonLues() === 0) {
      this.notificationToast.info('Aucune notification non lue');
      return;
    }

    if (!confirm(`Marquer les ${this.nombreNonLues()} notifications non lues comme lues ?`)) {
      return;
    }

    this.notificationPersistService.marquerToutesCommeLues().subscribe({
      next: () => {
        const notifications = this.toutesNotifications().map(n => ({
          ...n,
          lue: true,
          dateLecture: n.lue ? n.dateLecture : new Date().toISOString()
        }));
        this.toutesNotifications.set(notifications);
        this.notificationToast.success('Toutes les notifications ont été marquées comme lues');
      }
    });
  }

  /**
   * Changer le filtre de statut
   */
  changerFiltreStatut(statut: FiltreStatut): void {
    this.filtreStatut.set(statut);
  }

  /**
   * Changer le filtre de type
   */
  changerFiltreType(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtreType.set(select.value);
  }

  /**
   * Changer le tri
   */
  changerTri(tri: TriOption): void {
    this.triActif.set(tri);
  }

  /**
   * Basculer affichage groupé
   */
  toggleAffichageGroupe(): void {
    this.affichageGroupe.update(v => !v);
  }

  /**
   * Formater la date relative
   */
  getTempsRelatif(dateString: string): string {
    const date = new Date(dateString);
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== maintenant.getFullYear() ? 'numeric' : undefined
    });
  }

  /**
   * Formater la date complète
   */
  getDateComplete(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtenir la classe CSS selon le type
   */
  getNotificationClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'RESERVATION_CONFIRMEE': 'notif-success',
      'DEVIS_VALIDE': 'notif-info',
      'DEVIS_EXPIRE': 'notif-warning',
      'PAIEMENT_RECU': 'notif-success',
      'PAIEMENT_EN_ATTENTE': 'notif-info',
      'PAIEMENT_RETARD': 'notif-danger',
      'PAIEMENT_REFUSE': 'notif-danger',
      'LIVRAISON_PREVUE': 'notif-info',
      'LIVRAISON_EN_COURS': 'notif-primary',
      'LIVRAISON_EFFECTUEE': 'notif-success',
      'STOCK_CRITIQUE': 'notif-danger',
      'NOUVELLE_RESERVATION': 'notif-primary',
      'NOUVEAU_PAIEMENT': 'notif-primary',
      'NOUVELLE_RECLAMATION': 'notif-warning',
      'RETOUR_EN_RETARD': 'notif-danger'
    };

    return typeMap[type] || 'notif-default';
  }

  /**
   * Obtenir le libellé lisible du type
   */
  getTypeLibelle(type: string): string {
    // Transformer PAIEMENT_RECU en "Paiement reçu"
    return type.split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }
}
