import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../core/services/confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  private confirmationService = inject(ConfirmationService);

  showModal = false;
  config: any = null;

  ngOnInit(): void {
    this.confirmationService.confirmation$.subscribe((config) => {
      this.config = config;
      this.showModal = true;
    });
  }

  confirm(): void {
    this.config?.onConfirm();
    this.close();
  }

  cancel(): void {
    this.config?.onCancel();
    this.close();
  }

  close(): void {
    this.showModal = false;
    this.config = null;
  }
}
