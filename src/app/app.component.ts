import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TokenMonitorService} from './core/services/token-monitor.service';
import {StorageService} from './core/services/storage.service';
import {ConfirmationModalComponent} from './shared/confirmation-modal/confirmation-modal.component';
import {NotificationWrapperComponent} from './shared/notification-wrapper/notification-wrapper.component';
import {FooterComponent} from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmationModalComponent, NotificationWrapperComponent,FooterComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit,OnDestroy{

  title = 'elegant-hive';

  private tokenMonitor = inject(TokenMonitorService);
  private storage = inject(StorageService);

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    // Arrêter la surveillance quand l'application se ferme
    this.tokenMonitor.stopMonitoring();
  }
}
