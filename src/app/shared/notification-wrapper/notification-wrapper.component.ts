import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationConfig } from '../../services/notification.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-notification-wrapper',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <app-notification
      *ngIf="currentNotification"
      [config]="currentNotification"
      (closed)="onNotificationClosed()"
    ></app-notification>
  `
})
export class NotificationWrapperComponent implements OnInit, OnDestroy {
  currentNotification: NotificationConfig | null = null;
  private subscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(
      (config) => {
        this.currentNotification = config;
      }
    );
  }

  onNotificationClosed(): void {
    this.currentNotification = null;
    this.notificationService.hide();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
