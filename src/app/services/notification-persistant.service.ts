import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, tap, catchError, of } from 'rxjs';
import { NotificationResponse, NotificationCount } from '../core/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationPersistantService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/notifications';

  // Signals pour state management réactif
  notificationsNonLues = signal<NotificationResponse[]>([]);
  countNonLues = signal<number>(0);
  isLoading = signal<boolean>(false);

  // Polling interval (30 secondes)
  private pollingInterval = 30000;

  constructor() {
    // Démarrer le polling automatique si l'utilisateur est connecté
    this.startAutoRefresh();
  }

  /**
   * Récupérer toutes les notifications
   */
  getNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.API_URL);
  }

  /**
   * Récupérer les notifications non lues
   */
  getNotificationsNonLues(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.API_URL}/non-lues`).pipe(
      tap(notifications => this.notificationsNonLues.set(notifications))
    );
  }

  /**
   * Compter les notifications non lues
   */
  getCount(): Observable<NotificationCount> {
    return this.http.get<NotificationCount>(`${this.API_URL}/count`).pipe(
      tap(result => this.countNonLues.set(result.count))
    );
  }

  /**
   * Marquer une notification comme lue
   */
  marquerCommeLue(id: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(`${this.API_URL}/${id}/lire`, {}).pipe(
      tap(() => this.refreshCount())
    );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  marquerToutesCommeLues(): Observable<any> {
    return this.http.put(`${this.API_URL}/lire-toutes`, {}).pipe(
      tap(() => {
        this.countNonLues.set(0);
        this.refreshNotifications();
      })
    );
  }

  /**
   * Supprimer une notification
   */
  supprimerNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.refreshNotifications())
    );
  }

  /**
   * Rafraîchir le compteur
   */
  refreshCount(): void {
    this.getCount().subscribe();
  }

  /**
   * Rafraîchir les notifications
   */
  refreshNotifications(): void {
    this.isLoading.set(true);
    this.getNotificationsNonLues().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  /**
   * Démarrer le polling automatique
   */
  private startAutoRefresh(): void {
    // Refresh initial
    this.refreshCount();

    // Polling toutes les 30 secondes
    interval(this.pollingInterval).pipe(
      switchMap(() => this.getCount()),
      catchError(error => {
        console.error('Erreur lors du polling des notifications:', error);
        return of({ count: 0 });
      })
    ).subscribe();
  }
}
