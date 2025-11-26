import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationPersistantService } from '../../services/notification-persistant.service';
import { NotificationResponse } from '../../core/models/notification.model';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss']
})
export class NotificationPanelComponent implements OnInit {
  private notificationService = inject(NotificationPersistantService);
  private router = inject(Router);

  // State
  isOpen = signal<boolean>(false);
  notifications = computed(() => this.notificationService.notificationsNonLues());
  count = computed(() => this.notificationService.countNonLues());
  isLoading = computed(() => this.notificationService.isLoading());

  ngOnInit(): void {
    this.loadNotifications();
  }

  /**
   * Toggle du panneau
   */
  togglePanel(): void {
    this.isOpen.update(value => !value);
    if (this.isOpen()) {
      this.loadNotifications();
    }
  }

  /**
   * Charger les notifications
   */
  loadNotifications(): void {
    this.notificationService.refreshNotifications();
  }

  /**
   * Cliquer sur une notification
   */
  onNotificationClick(notification: NotificationResponse): void {
    // Marquer comme lue
    this.notificationService.marquerCommeLue(notification.idNotification).subscribe(() => {
      // Navigation si URL d'action existe
      if (notification.urlAction) {
        this.router.navigateByUrl(notification.urlAction);
        this.isOpen.set(false);
      }
    });
  }

  /**
   * Marquer toutes comme lues
   */
  marquerToutesCommeLues(): void {
    this.notificationService.marquerToutesCommeLues().subscribe();
  }

  /**
   * Supprimer une notification
   */
  supprimerNotification(event: Event, id: number): void {
    event.stopPropagation();
    this.notificationService.supprimerNotification(id).subscribe();
  }

  /**
   * Fermer le panneau en cliquant à l'extérieur
   */
  closePanel(): void {
    this.isOpen.set(false);
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

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
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
      'PAIEMENT_RETARD': 'notif-danger',
      'LIVRAISON_PREVUE': 'notif-info',
      'STOCK_CRITIQUE': 'notif-danger',
      'NOUVELLE_RESERVATION': 'notif-primary',
      'NOUVELLE_RECLAMATION': 'notif-warning'
    };

    return typeMap[type] || 'notif-default';
  }
}
