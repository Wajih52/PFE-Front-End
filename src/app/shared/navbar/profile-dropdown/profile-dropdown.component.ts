// src/app/shared/navbar/profile-dropdown/profile-dropdown.component.ts

import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ElementRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SidebarMenuService } from '../../../services/sidebar-menu.service';
import { AuthService } from '../../../core/services/auth.service';
import { MenuItem } from '../../../core/models/menu-item.model';

/**
 * Composant Dropdown du profil utilisateur
 * S'affiche au survol ou clic du bouton profil
 */
@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-dropdown.component.html',
  styleUrls: ['./profile-dropdown.component.scss']
})
export class ProfileDropdownComponent implements OnInit, OnDestroy {
  private sidebarMenuService = inject(SidebarMenuService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);

  /** Items du menu dropdown */
  dropdownItems: MenuItem[] = [];

  /** Nom de l'utilisateur */
  userName: string = '';

  /** Email de l'utilisateur */
  userEmail: string = '';

  /** Image de profil */
  userImage: string | null = null;

  /** État du dropdown (ouvert/fermé) */
  isOpen: boolean = false;

  private destroy$ = new Subject<void>();

  // Écouter les clics en dehors du composant pour fermer le dropdown
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (isPlatformBrowser(this.platformId)) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside && this.isOpen) {
        this.closeDropdown();
      }
    }
  }

  ngOnInit(): void {
    // Charger les items du dropdown
    this.loadDropdownItems();

    // Charger les infos utilisateur
    this.loadUserInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charger les items du dropdown depuis le service
   */
  private loadDropdownItems(): void {
    this.sidebarMenuService.getProfileDropdownItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.dropdownItems = items;
      });
  }

  /**
   * Charger les informations de l'utilisateur
   */
  private loadUserInfo(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userName = `${user.prenom} ${user.nom}`;
          this.userEmail = user.email;
          this.userImage = user.image ? `http://localhost:8080${user.image}` : null;
        }
      });
  }

  /**
   * Toggle l'état du dropdown
   */
  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * Ouvrir le dropdown
   */
  openDropdown(): void {
    this.isOpen = true;
  }

  /**
   * Fermer le dropdown
   */
  closeDropdown(): void {
    this.isOpen = false;
  }

  /**
   * Gérer le clic sur un item
   */
  onItemClick(item: MenuItem): void {
    if (item.disabled) {
      return;
    }

    // Fermer le dropdown
    this.closeDropdown();

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
   * Obtenir les initiales de l'utilisateur pour l'avatar
   */
  getUserInitials(): string {
    const names = this.userName.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return names[0]?.charAt(0) || '?';
  }

  /**
   * Obtenir les classes CSS pour un item
   */
  getItemClasses(item: MenuItem): string {
    const classes: string[] = ['dropdown-item'];

    if (item.disabled) {
      classes.push('disabled');
    }

    if (item.customClass) {
      classes.push(item.customClass);
    }

    return classes.join(' ');
  }
}
