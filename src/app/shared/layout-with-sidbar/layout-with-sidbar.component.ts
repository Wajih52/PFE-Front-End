// src/app/shared/layout-with-sidebar/layout-with-sidebar.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-layout-with-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="layout-wrapper">
      <div class="layout-container">
        <!-- Sidebar avec événement de collapse -->
        <app-sidebar (collapsedChange)="onSidebarCollapsedChange($event)"></app-sidebar>

        <!-- Contenu principal -->
        <main class="main-content" [class.sidebar-collapsed]="isSidebarCollapsed">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
          <!-- Footer intégré dans le main-content -->
<!--          <app-footer></app-footer>-->
        </main>
      </div>
    </div>
  `,
  styles: [`
    @use 'sass:color';

    // ✅ Wrapper global pour gérer le positionnement
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .layout-container {
      display: flex;
      flex: 1;
      margin-top: 80px;
      position: relative; // ✅ Important pour le positionnement relatif
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      background: #F8F9FA;
      transition: margin-left 0.3s ease;

      // ✅ Utiliser flexbox pour pousser le footer en bas
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 80px);

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

    // ✅ Wrapper pour le contenu qui pousse le footer en bas
    .content-wrapper {
      flex: 1;
      padding: 2rem;
    }

    // ✅ Le footer reste en bas naturellement grâce au flexbox
    ::ng-deep app-footer {
      margin-top: auto; // Pousse le footer en bas
    }
  `]
})
export class LayoutWithSidebarComponent {
  isSidebarCollapsed = false;

  onSidebarCollapsedChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}
