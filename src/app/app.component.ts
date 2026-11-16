import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {TokenMonitorService} from './core/services/token-monitor.service';
import {StorageService} from './core/services/storage.service';
import {ConfirmationModalComponent} from './shared/confirmation-modal/confirmation-modal.component';
import {NotificationWrapperComponent} from './shared/notification-wrapper/notification-wrapper.component';
import {NavbarComponent} from './shared/navbar/navbar.component';
import { ChatbotWidgetComponent } from './features/pages/chatbot/components/chatbot-widget/chatbot-widget.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    ConfirmationModalComponent,
    NotificationWrapperComponent,
    NavbarComponent,
    ChatbotWidgetComponent,
    NgIf],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit,OnDestroy{

  title = 'elegant-hive';

  private tokenMonitor = inject(TokenMonitorService);
  private storage = inject(StorageService);
  private router = inject(Router);

  // Liste des routes où la navbar et le chatbot DOIVENT être cachés
  private hiddenNavbarRoutes = [
    '/auth/first-login',
    '/auth/change-password',
    //'/auth/login',
    //'/auth/register',
    //'/auth/forgot-password',
    //'/auth/reset-password'
  ];

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    // Arrêter la surveillance quand l'application se ferme
    this.tokenMonitor.stopMonitoring();
  }

  // Vérifie si on doit afficher la navbar
  showNavbar(): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Ignore les queryParams
    return !this.hiddenNavbarRoutes.includes(currentUrl);
  }

  showChatbot(): boolean {
    return this.storage.isLoggedIn() && this.storage.isClient() && this.showNavbar();
  }
}
