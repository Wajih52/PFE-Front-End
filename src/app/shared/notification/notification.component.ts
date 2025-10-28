import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationConfig } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @Input() config: NotificationConfig | null = null;
  @Output() closed = new EventEmitter<void>();

  isVisible = false;
  isClosing = false;

  ngOnInit(): void {
    if (this.config) {
      setTimeout(() => {
        this.isVisible = true;
      }, 100);
    }
  }

  close(): void {
    if (this.isClosing) return;

    this.isClosing = true;
    this.isVisible = false;

    setTimeout(() => {
      this.closed.emit();
    }, 300);
  }

  getIcon(): string {
    if (!this.config) return '';

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[this.config.type];
  }

  getNotificationClass(): string {
    if (!this.config) return '';
    return `notification-${this.config.type}`;
  }
}
