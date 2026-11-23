import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../core/services/confirmation.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);

  showModal = false;
  config: any = null;
  inputValue = '';
  showPassword = false;

  ngOnInit(): void {
    this.confirmationService.confirmation$.subscribe((config) => {
      this.config = config;
      this.inputValue = '';
      this.showPassword = false;
      this.showModal = true;
    });
  }

  get currentInputType(): string {
    if (this.config?.inputType === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.config?.inputType || 'text';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  confirm(): void {
    if (this.config?.isPrompt) {
      if (!this.inputValue.trim()) return;
      this.config?.onConfirm(this.inputValue);
    } else {
      this.config?.onConfirm();
    }
    this.close();
  }

  cancel(): void {
    this.config?.onCancel();
    this.close();
  }

  close(): void {
    this.showModal = false;
    this.config = null;
    this.inputValue = '';
    this.showPassword = false;
  }
}
