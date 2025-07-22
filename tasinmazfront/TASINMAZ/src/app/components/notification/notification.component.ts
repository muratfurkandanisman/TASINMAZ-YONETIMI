import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications" 
        class="notification notification-{{notification.type}}"
        [class.slide-in]="true">
        <div class="notification-content">
          <div class="notification-icon">
            <i [class]="getIconClass(notification.type)"></i>
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <div class="notification-actions" *ngIf="notification.type === 'confirm'">
            <button class="notification-button confirm-button" (click)="onConfirm(notification)">
              Evet
            </button>
            <button class="notification-button cancel-button" (click)="onCancel(notification)">
              Hayır
            </button>
          </div>
          <button class="notification-close" (click)="closeNotification(notification.id)" *ngIf="notification.type !== 'confirm'">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }

    .notification-success {
      background: #22c55e;
      color: #fff;
      border: none;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.12);
    }

    .notification-error {
      background: #ef4444;
      color: #fff;
      border: none;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.12);
    }

    .notification-warning {
      background: #f59e42;
      color: #fff;
      border: none;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(245, 158, 66, 0.12);
    }

    .notification-info {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
    }

    .notification-confirm {
      background: #7c3aed;
      color: #fff;
      border: none;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.12);
    }
    /* Eski gradient ve duplicate bloklar kaldırıldı, sadece sade pastel bloklar kaldı */

    .notification-content {
      display: flex;
      align-items: center;
      padding: 18px 20px;
      gap: 14px;
    }

    .notification-icon {
      font-size: 20px;
      min-width: 24px;
      font-style: normal;
    }
    .notification-icon i {
      font-style: normal;
    }

    .notification-message {
      flex: 1;
      font-weight: 500;
      line-height: 1.4;
    }

    .notification-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
      min-width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-close:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .notification-actions {
      display: flex;
      gap: 8px;
      margin-left: 8px;
    }

    .notification-button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .confirm-button {
      background-color: rgba(255, 255, 255, 0.9);
      color: #667eea;
    }

    .confirm-button:hover {
      background-color: white;
    }

    .cancel-button {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .cancel-button:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .slide-in {
      animation: slideIn 0.3s ease-out;
    }

    /* Font Awesome alternatifi için modern ikonlar */
    .fa-check-circle::before { content: '✓'; }
    .fa-exclamation-triangle::before { content: '⚠'; }
    .fa-times-circle::before { content: '✕'; }
    .fa-info-circle::before { content: 'ℹ'; }
    .fa-question-circle::before { content: '?'; }
    .fa-times::before { content: '✕'; }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  onConfirm(notification: Notification): void {
    if (notification.confirmCallback) {
      notification.confirmCallback();
    }
    this.notificationService.remove(notification.id);
  }

  onCancel(notification: Notification): void {
    if (notification.cancelCallback) {
      notification.cancelCallback();
    }
    this.notificationService.remove(notification.id);
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'fa fa-check-circle';
      case 'error': return 'fa fa-times-circle';
      case 'warning': return 'fa fa-exclamation-triangle';
      case 'info': return 'fa fa-info-circle';
      case 'confirm': return 'fa fa-question-circle';
      default: return 'fa fa-info-circle';
    }
  }
}