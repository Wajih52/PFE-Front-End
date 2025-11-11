// src/app/shared/sidebar/sidebar.component.ts

import {Component, OnInit, OnDestroy, inject, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { SidebarMenuService } from '../../services/sidebar-menu.service';
import { MenuSection, MenuItem } from '../../core/models/menu-item.model';

/**
 * Composant Sidebar
 * Affiche les menus selon les rôles de l'utilisateur connecté
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private sidebarMenuService = inject(SidebarMenuService);
  private router = inject(Router);

  /** Sections de menu à afficher */
  menuSections: MenuSection[] = [];

  /** Route active actuelle */
  currentRoute: string = '';

  /** État du menu (collapsed ou non) */
  isCollapsed: boolean = false;

  /** Émet l'état collapsed pour le composant parent */
  @Output() collapsedChange = new EventEmitter<boolean>();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Charger les menus selon les rôles de l'utilisateur
    this.loadMenus();

    // Suivre les changements de route pour mettre à jour l'élément actif
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects || event.url;
      });

    // Initialiser la route actuelle
    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les menus depuis le service
   */
  private loadMenus(): void {
    this.sidebarMenuService.getSidebarMenus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(sections => {
        this.menuSections = sections;
      });
  }

  /**
   * Gérer le clic sur un élément de menu
   */
  onMenuItemClick(item: MenuItem): void {
    if (item.disabled) {
      return;
    }

    // Si c'est un séparateur, ne rien faire
    if (item.label === '---') {
      return;
    }

    // Si l'item a une action, l'exécuter
    if (item.action) {
      item.action();
      return;
    }

    // Sinon, naviguer vers la route
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  /**
   * Vérifier si un item est actif
   */
  isActive(item: MenuItem): boolean {
    if (!item.route) {
      return false;
    }

    // Correspondance exacte pour les routes racines
    if (item.route === this.currentRoute) {
      return true;
    }

    // Correspondance partielle pour les routes enfants
    return this.currentRoute.startsWith(item.route + '/');
  }

  /**
   * Obtenir les classes CSS pour un item
   */
  getItemClasses(item: MenuItem): string {
    const classes: string[] = ['sidebar-item'];

    if (this.isActive(item)) {
      classes.push('active');
    }

    if (item.disabled) {
      classes.push('disabled');
    }

    if (item.customClass) {
      classes.push(item.customClass);
    }

    return classes.join(' ');
  }

  /**
   * Toggle l'état collapsed de la sidebar
   */
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed); // ✅ Émettre l'événement
  }
}
