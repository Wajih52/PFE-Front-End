import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new Subject<ConfirmationConfig & {
    onConfirm: () => void;
    onCancel: () => void;
  }>();

  confirmation$ = this.confirmationSubject.asObservable();

  confirm(config: ConfirmationConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationSubject.next({
        ...config,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }

  /**
   * Demander une saisie utilisateur
   */
  async prompt(options: {
    title: string;
    message: string;
    placeholder?: string;
    inputType?: string;
  }): Promise<string | null> {
    // Implémentation selon votre système de confirmation
    // Peut utiliser un modal avec input
    return new Promise((resolve) => {
      const userInput = window.prompt(`${options.title}\n\n${options.message}`);
      resolve(userInput);
    });
  }
}
