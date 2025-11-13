// src/app/shared/layout-with-sidebar/layout-with-sidebar.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import {FooterComponent} from '../footer/footer.component';

/**
 * Composant Layout avec Sidebar
 * Utilise ce composant pour les pages qui nécessitent une sidebar
 *
 * Usage:
 * Wrappez vos routes avec ce layout dans votre routing configuration
 */
@Component({
  selector: 'app-layout-with-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, FooterComponent],
  template: `
    <div class="layout-container">
      <!-- Sidebar avec événement de collapse -->
      <app-sidebar (collapsedChange)="onSidebarCollapsedChange($event)"></app-sidebar>

      <!-- Contenu principal -->
      <main class="main-content" [class.sidebar-collapsed]="isSidebarCollapsed">
        <router-outlet></router-outlet>

      </main>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    @use 'sass:color';

    .layout-container {
      display: flex;
      min-height: calc(100vh - 80px);
      margin-top: 80px;
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      padding: 2rem;
      background: #F8F9FA;
      transition: margin-left 0.3s ease;

      //Forcer le contenu à prendre toute la hauteur
      min-height: calc(100vh - 80px); // Hauteur de la page - navbar
      display: flex;
      flex-direction: column;
      // Quand la sidebar est collapsed
      &.sidebar-collapsed {
        margin-left: 70px;
      }

      @media (max-width: 768px) {
        margin-left: 0;

        &.sidebar-collapsed {
          margin-left: 0;
        }
      }
    }
  `]
})
export class LayoutWithSidebarComponent {
  isSidebarCollapsed = false;

  /**
   * Gérer le changement d'état de la sidebar
   */
  onSidebarCollapsedChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}
