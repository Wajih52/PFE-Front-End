import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ConfirmationService } from './confirmation.service';
import { from, switchMap, Observable, EMPTY } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActionSensibleService {

  private confirmationService = inject(ConfirmationService);

  /**
   * Enveloppe une requête HTTP avec une demande de mot de passe
   */
  executer<T>(
    titre: string,
    message: string,
    requeteHttpCallback: (headers: HttpHeaders) => Observable<T>
  ): Observable<T> {

    // 1. Ouvre la modale
    const promiseModal = this.confirmationService.prompt({
      title: titre,
      message: message,
      inputType: 'password'
    });

    // 2. Transforme la promesse en Observable pour chainer la requête
    return from(promiseModal).pipe(
      switchMap(password => {
        // Si l'utilisateur clique sur Annuler ou ne saisit rien, on stoppe le flux
        if (!password) return EMPTY;

        // 3. Prépare le Header et lance la requête API
        const headers = new HttpHeaders().set('X-Confirm-Password', password);
        return requeteHttpCallback(headers);
      })
    );
  }
}
