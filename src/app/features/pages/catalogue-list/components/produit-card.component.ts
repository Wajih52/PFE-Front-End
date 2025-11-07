// src/app/features/catalogue/components/produit-card.component.ts

import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProduitResponse } from '../../../../core/models';

@Component({
  selector: 'app-produit-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="produit-card">
      <a [routerLink]="['/produits', produit.idProduit]" class="card-link">
        <!-- Image -->
        <div class="card-image">
          <img
            [src]="produit.imageProduit || 'assets/images/placeholder-product.jpg'"
            [alt]="produit.nomProduit"
            loading="lazy"
          />

          <!-- Badge disponibilité -->
          <div class="badge-disponibilite" [class.indisponible]="!estDisponible()">
            <i [class]="estDisponible() ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            {{ estDisponible() ? 'Disponible' : 'Indisponible' }}
          </div>

          <!-- Badge catégorie -->
          <div class="badge-categorie">
            {{ formatCategorie(produit.categorieProduit) }}
          </div>
        </div>

        <!-- Contenu -->
        <div class="card-content">
          <h3 class="card-title">{{ produit.nomProduit }}</h3>

          <p class="card-description" *ngIf="produit.descriptionProduit">
            {{ produit.descriptionProduit | slice:0:80 }}{{ produit.descriptionProduit.length > 80 ? '...' : '' }}
          </p>

          <!-- Info stock -->
          <div class="card-stock">
            <i class="fas fa-box"></i>
            <span *ngIf="produit.typeProduit === 'EN_QUANTITE'">
              {{ produit.quantiteDisponible }} disponibles
            </span>
          </div>

          <!-- Prix -->
          <div class="card-footer">
            <div class="prix">
              <span class="montant">{{ produit.prixUnitaire | number:'1.2-2' }}</span>
              <span class="unite">TND / jour</span>
            </div>

            <button class="btn-details">
              Voir détails <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </a>
    </div>
  `,
  styles: [`
    .produit-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      }

      .card-link {
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    }

    .card-image {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      background: #F5F5F5;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }

      .badge-disponibilite {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #27AE60;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 5px;

        &.indisponible {
          background: #E74C3C;
        }

        i {
          font-size: 0.9rem;
        }
      }

      .badge-categorie {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .card-content {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .card-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1A1A1A;
      margin: 0 0 10px 0;
      line-height: 1.3;
    }

    .card-description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 15px;
      flex: 1;
    }

    .card-stock {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 15px;
      padding: 8px 0;
      border-top: 1px solid #F0F0F0;
      border-bottom: 1px solid #F0F0F0;

      i {
        color: #C8A882;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      margin-top: auto;
    }

    .prix {
      display: flex;
      flex-direction: column;

      .montant {
        font-size: 1.5rem;
        font-weight: 700;
        color: #C8A882;
        line-height: 1;
      }

      .unite {
        font-size: 0.8rem;
        color: #999;
        margin-top: 2px;
      }
    }

    .btn-details {
      background: #1A1A1A;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;

      &:hover {
        background: #C8A882;
        transform: translateX(3px);
      }

      i {
        font-size: 0.8rem;
        transition: transform 0.3s ease;
      }

      &:hover i {
        transform: translateX(3px);
      }
    }

    @media (max-width: 768px) {
      .card-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-details {
        justify-content: center;
      }
    }
  `]
})
export class ProduitCardComponent {
  @Input({ required: true }) produit!: ProduitResponse;

  estDisponible(): boolean {

      return this.produit.quantiteDisponible != null && this.produit.quantiteDisponible > 0;

  }

  formatCategorie(categorie: string): string {
    return categorie.replace(/_/g, ' ');
  }
}
