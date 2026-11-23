import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  isPrompt?: boolean;
  inputType?: string;
  placeholder?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new Subject<ConfirmationConfig & {
    onConfirm: (value?: string) => void;
    onCancel: () => void;
  }>();

  confirmation$ = this.confirmationSubject.asObservable();

  confirm(config: ConfirmationConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationSubject.next({
        ...config,
        isPrompt: false,
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
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
  }): Promise<string | null> {
    return new Promise((resolve) => {
      this.confirmationSubject.next({
        title: options.title,
        message: options.message,
        placeholder: options.placeholder || 'Saisissez votre mot de passe',
        inputType: options.inputType || 'text',
        confirmText: options.confirmText || 'Confirmer',
        cancelText: options.cancelText || 'Annuler',
        type: options.type || 'danger',
        isPrompt: true,
        onConfirm: (value?: string) => resolve(value ?? null),
        onCancel: () => resolve(null)
      });
    });
  }
}
