// src/app/test-jwt.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JwtHelperService, TokenInfo } from '../core/services/jwt-helper.service';
import { StorageService } from '../core/services/storage.service';

@Component({
  selector: 'app-test-jwt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>Test JWT Decoder</h2>

      <div class="section" *ngIf="token">
        <h3>Token trouvé</h3>
        <p class="token">{{ tokenPreview }}</p>
        <button (click)="toggleFullToken()">
          {{ showFullToken ? 'Masquer' : 'Afficher' }} token complet
        </button>
        <p *ngIf="showFullToken" class="token-full">{{ token }}</p>
      </div>

      <div class="section" *ngIf="!token">
        <h3>Aucun token</h3>
        <p>Connectez-vous d'abord pour voir les informations du token</p>
      </div>

      <div class="section" *ngIf="tokenInfo">
        <h3>Informations du Token</h3>
        <table>
          <tr>
            <td><strong>Username (sub):</strong></td>
            <td>{{ tokenInfo.username }}</td>
          </tr>
          <tr>
            <td><strong>Créé le (iat):</strong></td>
            <td>{{ tokenInfo.issuedAt | date:'dd/MM/yyyy HH:mm:ss' }}</td>
          </tr>
          <tr>
            <td><strong>Expire le (exp):</strong></td>
            <td>{{ tokenInfo.expiresAt | date:'dd/MM/yyyy HH:mm:ss' }}</td>
          </tr>
          <tr>
            <td><strong>Est expiré:</strong></td>
            <td [class.expired]="tokenInfo.isExpired">
              {{ tokenInfo.isExpired ? ' OUI' : ' NON' }}
            </td>
          </tr>
          <tr *ngIf="!tokenInfo.isExpired">
            <td><strong>Temps restant:</strong></td>
            <td>{{ formatTimeRemaining(tokenInfo.timeRemaining) }}</td>
          </tr>
        </table>
      </div>

      <div class="section" *ngIf="tokenInfo">
        <h3>Payload JWT complet</h3>
        <pre>{{ tokenInfo.raw | json }}</pre>
      </div>

      <div class="section">
        <h3>Informations Utilisateur (localStorage)</h3>
        <div *ngIf="user">
          <p><strong>Nom:</strong> {{ user.nom }} {{ user.prenom }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Rôles:</strong> {{ user.roles.join(', ') }}</p>
          <p class="info">Les rôles viennent de /utilisateurs/me, pas du JWT</p>
        </div>
        <p *ngIf="!user">Aucun utilisateur connecté</p>
      </div>

      <div class="actions">
        <button (click)="testExpiration()">Tester expiration</button>
        <button (click)="refreshInfo()">Actualiser</button>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    h2 {
      color: #333;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 10px;
    }

    .section {
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    h3 {
      margin-top: 0;
      color: #555;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    table tr {
      border-bottom: 1px solid #eee;
    }

    table td {
      padding: 10px 5px;
    }

    table td:first-child {
      width: 200px;
    }

    .expired {
      color: red;
      font-weight: bold;
    }

    .token {
      background: #fff;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      word-break: break-all;
      margin: 10px 0;
    }

    .token-full {
      background: #fff;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: monospace;
      font-size: 10px;
      word-break: break-all;
      margin: 10px 0;
      max-height: 200px;
      overflow-y: auto;
    }

    pre {
      background: #fff;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }

    .info {
      background: #e3f2fd;
      padding: 10px;
      border-left: 4px solid #2196F3;
      margin: 10px 0;
    }

    .actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    button {
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    button:hover {
      background: #45a049;
    }
  `]
})
export class TestJwtComponent implements OnInit {
  private jwtHelper = inject(JwtHelperService);
  private storage = inject(StorageService);

  token: string | null = null;
  tokenInfo: TokenInfo | null = null;
  user: any = null;
  tokenPreview: string = '';
  showFullToken = false;

  ngOnInit(): void {
    this.refreshInfo();
  }

  refreshInfo(): void {
    // Récupérer le token
    this.token = this.storage.getRawToken();

    if (this.token) {
      // Preview du token (premiers et derniers caractères)
      this.tokenPreview =
        this.token.substring(0, 30) + '...' +
        this.token.substring(this.token.length - 30);

      // Décoder le token
      this.tokenInfo = this.jwtHelper.getTokenInfo(this.token);
    }

    // Récupérer l'utilisateur
    this.user = this.storage.getUser();
  }

  toggleFullToken(): void {
    this.showFullToken = !this.showFullToken;
  }

  formatTimeRemaining(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} jour(s), ${hours % 24} heure(s)`;
    } else if (hours > 0) {
      return `${hours} heure(s), ${minutes % 60} minute(s)`;
    } else {
      return `${minutes} minute(s)`;
    }
  }

  testExpiration(): void {
    if (!this.token) {
      alert('Aucun token à tester');
      return;
    }

    const isExpired = this.jwtHelper.isTokenExpired(this.token);
    const isValid = this.jwtHelper.isTokenValid(this.token);

    alert(
      `Test d'expiration:\n\n` +
      `Token expiré: ${isExpired ? 'OUI ' : 'NON '}\n` +
      `Token valide: ${isValid ? 'OUI ' : 'NON '}\n\n` +
      `Vérifiez la console pour plus de détails.`
    );

    console.log('=== TEST JWT ===');
    console.log('Token:', this.token);
    console.log('Token Info:', this.tokenInfo);
    console.log('Is Expired:', isExpired);
    console.log('Is Valid:', isValid);
  }
}
