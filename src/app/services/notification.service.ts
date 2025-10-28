import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showIcon?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationConfig | null>(null);
  public notification$: Observable<NotificationConfig | null> = this.notificationSubject.asObservable();

  private currentTimeout: any = null;

  // Méthode principale pour afficher une notification
  show(config: NotificationConfig): void {
    // Annuler le timeout précédent s'il existe
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }

    // Émettre la nouvelle notification
    this.notificationSubject.next(config);

    // Fermeture automatique après la durée spécifiée
    const duration = config.duration || (config.type === 'error' ? 4000 : 3000);
    this.currentTimeout = setTimeout(() => {
      this.hide();
    }, duration);
  }

  // Masquer la notification manuellement
  hide(): void {
    this.notificationSubject.next(null);
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  // Méthodes rapides
  success(message: string, duration?: number): void {
    this.show({
      message,
      type: 'success',
      duration,
      showIcon: true
    });
  }

  error(message: string, duration?: number): void {
    this.show({
      message,
      type: 'error',
      duration,
      showIcon: true
    });
  }

  warning(message: string, duration?: number): void {
    this.show({
      message,
      type: 'warning',
      duration,
      showIcon: true
    });
  }

  info(message: string, duration?: number): void {
    this.show({
      message,
      type: 'info',
      duration,
      showIcon: true
    });
  }
}
