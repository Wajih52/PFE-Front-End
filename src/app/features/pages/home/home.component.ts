// src/app/features/pages/home/home.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { PanierService } from '../../../services/panier.service';
import {NavbarComponent} from '../../../shared/navbar/navbar.component';
interface Service {
  icon: string;
  title: string;
  description: string;
}

interface FeaturedProduct {
  id: number;
  name: string;
  category: string;
  image: string;
  price: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);
  private panierService = inject(PanierService);

  totalPanier = this.panierService.totalArticles;

  isAuthenticated = false;
  userName: string | null = null;

  // Services proposés
  services: Service[] = [
    {
      icon: '💍',
      title: 'Mariages',
      description: 'Des célébrations inoubliables avec une décoration élégante et sur mesure'
    },
    {
      icon: '🎂',
      title: 'Anniversaires',
      description: 'Fêtez vos moments spéciaux avec style et créativité'
    },
    {
      icon: '💐',
      title: 'Fiançailles',
      description: 'Marquez le début de votre histoire avec une soirée romantique'
    },
    {
      icon: '🎪',
      title: 'Événements Professionnels',
      description: 'Des solutions complètes pour vos conférences et séminaires'
    }
  ];

  // Produits en vedette
  featuredProducts: FeaturedProduct[] = [
    {
      id: 1,
      name: 'Chaise Napoléon Transparente',
      category: 'Mobilier',
      image: 'assets/images/products/chair-napoleon.jpg',
      price: '3.5 TND'
    },
    {
      id: 2,
      name: 'Table Ronde Élégante',
      category: 'Mobilier',
      image: 'assets/images/products/table-round.jpg',
      price: '2 TND'
    },
    {
      id: 3,
      name: 'Décoration Florale Premium',
      category: 'Décoration',
      image: 'assets/images/products/decoration.jpg',
      price: '50 TND'
    },
    {
      id: 4,
      name: 'Éclairage Ambiance',
      category: 'Éclairage',
      image: 'assets/images/products/lighting.jpg',
      price: '25 TND'
    }
  ];

  ngOnInit(): void {
    this.checkAuthentication();
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  private checkAuthentication(): void {
    const token = this.storage.getToken();
    this.isAuthenticated = !!token;

    if (this.isAuthenticated) {
      this.userName = this.storage.getUserName();
    }
  }




  /**
   * Navigation vers le catalogue
   */
  goToCatalogue(): void {
    this.router.navigate(['/catalogue']);
  }




  /**
   * Scroll vers une section spécifique
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Gestion des erreurs d'image
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-product.jpg';
  }
}
