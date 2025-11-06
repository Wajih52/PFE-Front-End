// src/app/features/pages/home/home.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

interface Service {
  icon: string;
  title: string;
  description: string;
  image: string;
}

interface Testimonial {
  name: string;
  avatar: string;
  text: string;
  rating: number;
}

/**
 * Composant de la page d'accueil
 * Hero section avec carousel, services, témoignages
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  // Carousel d'images hero
  heroImages: string[] = [
    'assets/images/hero-1.jpg', // Remplacer par vos images
    'assets/images/hero-2.jpg',
    'assets/images/hero-3.jpg',
    'assets/images/hero-4.jpg'
  ];

  currentHeroIndex = 0;
  carouselInterval: any;

  // Services proposés
  services: Service[] = [
    {
      icon: '💐',
      title: 'Décoration Florale',
      description: 'Créez une ambiance unique avec nos compositions florales sur mesure',
      image: 'assets/images/service-decoration.jpg'
    },
    {
      icon: '🪑',
      title: 'Mobilier & Equipement',
      description: 'Large gamme de mobilier élégant pour tous vos événements',
      image: 'assets/images/service-mobilier.jpg'
    },
    {
      icon: '💡',
      title: 'Éclairage Pro',
      description: 'Solutions d\'éclairage professionnelles pour sublimer vos espaces',
      image: 'assets/images/service-lumiere.jpg'
    },
    {
      icon: '🎵',
      title: 'Sonorisation',
      description: 'Équipements audio de qualité pour tous types d\'événements',
      image: 'assets/images/service-sono.jpg'
    },
    {
      icon: '🏗️',
      title: 'Structures',
      description: 'Chapiteaux, arches et structures pour vos événements en plein air',
      image: 'assets/images/service-structure.jpg'
    },
    {
      icon: '🍽️',
      title: 'Restauration',
      description: 'Matériel de restauration professionnel pour votre service traiteur',
      image: 'assets/images/service-restauration.jpg'
    }
  ];

  // Témoignages clients
  testimonials: Testimonial[] = [
    {
      name: 'Sarah & Ahmed',
      avatar: 'assets/images/avatar-1.jpg',
      text: 'Une équipe formidable qui a rendu notre mariage inoubliable. Le matériel était impeccable et le service irréprochable !',
      rating: 5
    },
    {
      name: 'Mohamed Ben Ali',
      avatar: 'assets/images/avatar-2.jpg',
      text: 'Excellent service pour notre événement d\'entreprise. Professionnalisme et qualité au rendez-vous.',
      rating: 5
    },
    {
      name: 'Leila & Karim',
      avatar: 'assets/images/avatar-3.jpg',
      text: 'Nous recommandons vivement ! L\'équipe a su transformer notre vision en réalité.',
      rating: 5
    }
  ];

  // Statistiques
  stats = [
    { value: '500+', label: 'Événements Réussis' },
    { value: '1000+', label: 'Clients Satisfaits' },
    { value: '15+', label: 'Années d\'Expérience' },
    { value: '100%', label: 'Engagement Qualité' }
  ];

  ngOnInit(): void {
    this.startCarousel();
    this.initScrollAnimations();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  /**
   * Démarrer le carousel automatique
   */
  startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextHeroImage();
    }, 5000); // Change toutes les 5 secondes
  }

  /**
   * Image suivante du carousel
   */
  nextHeroImage(): void {
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
  }

  /**
   * Image précédente du carousel
   */
  previousHeroImage(): void {
    this.currentHeroIndex = this.currentHeroIndex === 0
      ? this.heroImages.length - 1
      : this.currentHeroIndex - 1;
  }

  /**
   * Aller à une image spécifique
   */
  goToHeroImage(index: number): void {
    this.currentHeroIndex = index;
  }

  /**
   * Initialiser les animations au scroll
   */
  initScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    // Observer tous les éléments animables
    setTimeout(() => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => observer.observe(el));
    }, 100);
  }

  /**
   * Navigation vers la page de réservation
   */
  navigateToBooking(): void {
    this.router.navigate(['/catalogue']);
  }

  /**
   * Navigation vers les services
   */
  navigateToServices(): void {
    this.router.navigate(['/services']);
  }

  /**
   * Générer un array pour les étoiles
   */
  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  /**
   * Scroll vers une section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
